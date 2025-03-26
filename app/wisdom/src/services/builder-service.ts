import ISchemaRepository from "integrations/i-schema-repository";
import PageService from "./page-service";
import { Render } from "@ipheion/html";
import Path from "path";
import Fs from "fs/promises";
import IConfigRepository from "integrations/i-config-repository";
import { Config } from "types/config";
import * as Js from "@ipheion/js-model";
import EsBuild from "esbuild";
import WholemealLoader from "@ipheion/wholemeal/dist/esbuild";
import { Database, State } from "state";
import HooksService from "./hooks-service";
import { RenderResult, Component } from "@ipheion/wholemeal/dist/compiler";
import { v4 as Guid } from "uuid";
import PropertiesService from "./properties-service";
import { MediaDir } from "state/media";

export default class BuilderService {
  readonly #page_service: PageService;
  readonly #schema_repository: ISchemaRepository;
  readonly #config_repository: IConfigRepository;
  readonly #state: State;
  readonly #hooks_service: HooksService;
  readonly #properties_service: PropertiesService;

  constructor(
    page_service: PageService,
    schema_repository: ISchemaRepository,
    config_repository: IConfigRepository,
    state: State,
    hooks_service: HooksService,
    properties_service: PropertiesService
  ) {
    this.#page_service = page_service;
    this.#schema_repository = schema_repository;
    this.#config_repository = config_repository;
    this.#state = state;
    this.#hooks_service = hooks_service;
    this.#properties_service = properties_service;
  }

  async #get_components() {
    const components = await this.#schema_repository.get_components();
    return (
      await Promise.all(
        components.map((c) => this.#schema_repository.get_component(c))
      )
    ).reduce(
      (c, n) => ({ ...c, [n.Metadata.Name]: n }),
      {} as Record<string, Component>
    );
  }

  async #render_block(id: string, slot?: string): Promise<RenderResult> {
    const entry = this.#page_service.GetBlock(id);
    let schema = await this.#schema_repository.get_block(entry.type);

    try {
      if (schema.HasBehaviour) {
        let css = "";
        const children: Array<string> = [];
        for (const id in entry.slots) {
          const value = entry.slots[id];
          for (const v of value) {
            const result = await this.#render_block(v, id);
            css += result.css;
            children.push(result.html);
          }
        }

        return {
          html: Render({
            tag: schema.Metadata.Name,
            attributes: {
              ...entry.properties,
              ...(slot ? { slot } : {}),
            },
            children,
          }),
          css,
          web_components: {
            [schema.Metadata.Name]: schema,
          },
        };
      }

      let css = "";
      let web_components: Record<string, Component> = {};
      const children: Record<string, string> = {};
      for (const id in entry.slots) {
        const value = entry.slots[id];
        for (const v of value) {
          const result = await this.#render_block(v, id);
          css += result.css;
          web_components = {
            ...web_components,
            ...result.web_components,
          };
          children[id] = (children[id] ?? "") + result.html;
        }
      }
      const result = await schema.ToString({
        components: await this.#get_components(),
        parameters: {
          self: this.#properties_service.ProcessProps(entry.properties),
          page: entry,
          tree: this.#page_service.Tree,
          database: Database,
          site_properties: this.#state.properties,
        },
        slots: children,
      });

      return {
        ...result,
        css: result.css + css,
      };
    } catch (err) {
      console.log(
        `Failed to render block ${schema.Metadata.Name}. Error below.`
      );
      throw err;
    }
  }

  async #build_page(
    id: string,
    location: string,
    slots: Record<string, string>,
    is_home = false
  ): Promise<Record<string, Component>> {
    const entry = this.#page_service.TreePage(id);
    const schema = await this.#schema_repository.get_layout(entry.layout);

    try {
      const output = is_home
        ? Path.resolve(location, "index.html")
        : Path.resolve(location, entry.slug, "index.html");

      let css = "";
      let web_components: Record<string, Component> = {};
      const children: Record<string, string> = {};
      for (const id in entry.slots) {
        const value = entry.slots[id];
        for (const v of value) {
          const result = await this.#render_block(v, id);
          css += result.css;
          web_components = {
            ...web_components,
            ...result.web_components,
          };
          children[id] = (children[id] ?? "") + result.html;
        }
      }

      const data = await schema.ToString({
        components: await this.#get_components(),
        parameters: {
          self: this.#properties_service.ProcessProps(entry.properties),
          page: entry,
          tree: this.#page_service.Tree,
          database: Database,
          site_properties: this.#state.properties,
        },
        slots: {
          ...slots,
          ...children,
          scripts:
            (slots.scripts ?? "") +
            Render({
              tag: "link",
              attributes: {
                rel: "stylesheet",
                href: "styles.css",
              },
              children: [],
            }),
        },
      });

      try {
        await Fs.mkdir(Path.dirname(output), { recursive: true });
      } catch {
        // We do not care if the directory already exists
      }

      await Fs.writeFile(output, "<!DOCTYPE html>\n" + data.html);
      await Fs.writeFile(
        Path.resolve(Path.dirname(output), "styles.css"),
        css + data.css
      );

      for (const child of this.#page_service.GetChildren(id))
        web_components = {
          ...web_components,
          ...(await this.#build_page(
            child.id,
            is_home ? location : Path.resolve(location, entry.slug),
            slots
          )),
        };

      return web_components;
    } catch (err) {
      console.log(
        `Failed to render page ${schema.Metadata.Name}. Error below.`
      );
      console.error(err);

      return {};
    }
  }

  async #build_scripts(
    config: Config,
    web_components: Record<string, Component>,
    script_file: string
  ) {
    const with_paths = await Promise.all(
      Object.keys(web_components).map(
        async (c) =>
          [
            (await this.#schema_repository.is_block(c))
              ? Path.resolve(config.blocks, c + ".std")
              : Path.resolve(config.components, c + ".std"),
            web_components[c],
          ] as const
      )
    );

    const template = [
      new Js.Import("CreateComponent", "@ipheion/wholemeal", false),
      ...with_paths.map(
        ([path, schema]) =>
          new Js.Call(
            new Js.Access("define", new Js.Reference("customElements")),
            new Js.String(schema.Metadata.Name),
            new Js.Call(
              new Js.Reference("CreateComponent"),
              new Js.Function(
                [],
                "arrow",
                undefined,
                new Js.Call(new Js.Reference("import"), new Js.String(path))
              )
            )
          )
      ),
    ]
      .map((i) => i.toString())
      .join(";\n");
    const outdir = Path.resolve(config.dist_dir, "_js", script_file);

    await EsBuild.build({
      stdin: {
        contents: template,
        resolveDir: __dirname,
      },
      outdir: outdir,
      splitting: true,
      bundle: true,
      platform: "browser",
      format: "esm",
      plugins: [WholemealLoader()],
      minify: true,
      alias: {
        "@ipheion/wholemeal": Path.resolve(
          __dirname,
          "../../../../lib/wholemeal/dist/mod.js"
        ),
      },
    });
  }

  async #build_files(config: Config) {
    const process = async (id: string, subject: MediaDir, dir: string) => {
      try {
        await Fs.mkdir(dir, { recursive: true });
      } catch {
        // We do not care if it does exist
      }

      for (const file of subject.files) {
        const instance = this.#state.files[file.local_name];

        await Fs.writeFile(
          Path.resolve(dir, file.name),
          Buffer.from(instance.data)
        );
      }

      const children = this.#state.media.Filter(
        (_, value) => value.parent === id
      );
      for (const [id, child] of children)
        await process(id, child, Path.resolve(dir, child.slug));
    };

    const [[id, home]] = this.#state.media.Filter(
      (_, value) => value.parent === null
    );
    await process(id, home, Path.resolve(config.dist_dir, "_files"));
  }

  async BuildApp() {
    try {
      const home = this.#page_service.HomePage;
      if (!home)
        throw new Error(
          "A homepage is required to build the app. Run wisdom setup to acheive this."
        );

      const config = await this.#config_repository.GetConfig();
      try {
        for (const item of await Fs.readdir(config.dist_dir))
          await Fs.rm(Path.resolve(config.dist_dir, item), {
            recursive: (
              await Fs.stat(Path.resolve(config.dist_dir, item))
            ).isDirectory(),
          });
        await Fs.rm(config.dist_dir, { recursive: true });
      } catch {
        // We do not care if it does not exist
      }

      try {
        await Fs.mkdir(config.dist_dir);
      } catch {
        // We do not care if it does not exist
      }
      await this.#hooks_service.Trigger("pre-build", config.dist_dir);

      for (const pub of config.publics)
        await Fs.cp(
          Path.resolve(pub.at),
          Path.resolve(config.dist_dir, pub.prefix),
          { recursive: true }
        );

      const script_file = Guid();

      const web_components = await this.#build_page(
        home.id,
        config.dist_dir,
        {
          scripts: [
            Render({
              tag: "script",
              attributes: {
                type: "module",
                src: `/_js/${script_file}/stdin.js`,
              },
              children: [],
            }),
          ].join(""),
        },
        true
      );

      await this.#build_scripts(config, web_components, script_file);

      await this.#build_files(config);
      await this.#hooks_service.Trigger("post-build", config.dist_dir);
    } catch (err) {
      debugger;
      console.error(err);
    }
  }
}
