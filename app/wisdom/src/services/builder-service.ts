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

export default class BuilderService {
  readonly #page_service: PageService;
  readonly #schema_repository: ISchemaRepository;
  readonly #config_repository: IConfigRepository;
  readonly #state: State;
  readonly #hooks_service: HooksService;

  constructor(
    page_service: PageService,
    schema_repository: ISchemaRepository,
    config_repository: IConfigRepository,
    state: State,
    hooks_service: HooksService
  ) {
    this.#page_service = page_service;
    this.#schema_repository = schema_repository;
    this.#config_repository = config_repository;
    this.#state = state;
    this.#hooks_service = hooks_service;
  }

  async #render_block(id: string, slot?: string): Promise<string> {
    const entry = this.#page_service.GetBlock(id);
    let schema = await this.#schema_repository.get_block(entry.type);

    return Render({
      tag: schema.Metadata.Name,
      attributes: {
        ...entry.properties,
        ...(slot ? { slot } : {}),
      },
      children: await Promise.all(
        Object.keys(entry.slots)
          .map((s) => [s, entry.slots[s]] as const)
          .flatMap(([k, v]) => v.map((v) => this.#render_block(v, k)))
      ),
    });
  }

  async #build_page(
    id: string,
    location: string,
    slots: Record<string, string>,
    is_home = false
  ) {
    const entry = this.#page_service.TreePage(id);
    const schema = await this.#schema_repository.get_layout(entry.layout);

    const output = is_home
      ? Path.resolve(location, "index.html")
      : Path.resolve(location, entry.slug, "index.html");

    const cms_slots = (
      await Promise.all(
        Object.keys(entry.slots)
          .map((s) => [s, entry.slots[s]] as const)
          .map(
            async ([k, v]) =>
              [
                k,
                await Promise.all(v.map((v) => this.#render_block(v))),
              ] as const
          )
      )
    ).reduce(
      (c, [k, v]) => ({ ...c, [k]: v.join("") }),
      {} as Record<string, string>
    );

    const html = await schema.ToString({
      components: {},
      parameters: {
        self: entry.properties,
        page: entry,
        tree: this.#page_service.Tree,
        database: Database,
        site_properties: this.#state.properties,
      },
      slots: {
        ...slots,
        ...cms_slots,
      },
    });

    try {
      await Fs.mkdir(Path.dirname(output), { recursive: true });
    } catch {
      // We do not care if the directory already exists
    }

    await Fs.writeFile(output, "<!DOCTYPE html>\n" + html.html);

    for (const child of this.#page_service.GetChildren(id))
      await this.#build_page(
        child.id,
        is_home ? location : Path.resolve(location, entry.slug),
        slots
      );
  }

  async #build_scripts(config: Config) {
    const blocks = await this.#schema_repository.get_blocks();
    const components = await this.#schema_repository.get_components();

    const dir = __dirname.endsWith("handlers")
      ? Path.resolve(__dirname, "..")
      : __dirname;
    const template = [
      new Js.Import("CreateComponent", "@ipheion/wholemeal", false),
      ...(await Promise.all(
        blocks.map(async (c) => {
          const schema = await this.#schema_repository.get_block(c);
          return new Js.Call(
            new Js.Access("define", new Js.Reference("customElements")),
            new Js.String(schema.Metadata.Name),
            new Js.Call(
              new Js.Reference("CreateComponent"),
              new Js.Function(
                [],
                "arrow",
                undefined,
                new Js.Call(
                  new Js.Reference("import"),
                  new Js.String(Path.resolve(config.blocks, c + ".std"))
                )
              )
            )
          );
        })
      )),
      ...(await Promise.all(
        components.map(async (c) => {
          const schema = await this.#schema_repository.get_component(c);
          return new Js.Call(
            new Js.Access("define", new Js.Reference("customElements")),
            new Js.String(schema.Metadata.Name),
            new Js.Call(
              new Js.Reference("CreateComponent"),
              new Js.Function(
                [],
                "arrow",
                undefined,
                new Js.Call(
                  new Js.Reference("import"),
                  new Js.String(Path.resolve(config.components, c + ".std"))
                )
              )
            )
          );
        })
      )),
    ]
      .map((i) => i.toString())
      .join(";\n");
    const outdir = Path.resolve(config.dist_dir, "_js");

    await EsBuild.build({
      stdin: {
        contents: template,
        resolveDir: __dirname,
      },
      outdir: outdir,
      entryNames: "[name]-[hash]",
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
        "@ipheion/wholemeal/dist/runner/component": Path.resolve(
          __dirname,
          "../../../../lib/wholemeal/dist/runner/component.js"
        ),
      },
    });

    const files = await Fs.readdir(outdir);

    const result = files.find((f) => f.startsWith("stdin-"));

    if (!result) throw new Error("Could not find file to create");
    return result;
  }

  async #build_images(config: Config) {
    const dir = Path.resolve(config.dist_dir, "_images");
    try {
      await Fs.mkdir(dir, { recursive: true });
    } catch {
      // We do not care if it does exist
    }

    for (const [id, data] of this.#state.media) {
      for (const file of data.files) {
        const instance = this.#state.files[file.local_name];

        await Fs.writeFile(
          Path.resolve(dir, [id, file.name].join("_")),
          Buffer.from(instance.data)
        );
      }
    }
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

      const script_file = await this.#build_scripts(config);

      for (const pub of config.publics)
        await Fs.cp(
          Path.resolve(pub.at),
          Path.resolve(config.dist_dir, pub.prefix),
          { recursive: true }
        );

      await this.#build_page(
        home.id,
        config.dist_dir,
        {
          scripts: [
            Render({
              tag: "script",
              attributes: {
                type: "module",
                src: `/_js/${script_file}`,
              },
              children: [],
            }),
          ].join(""),
        },
        true
      );

      await this.#build_images(config);
      await this.#hooks_service.Trigger("post-build", config.dist_dir);
    } catch (err) {
      debugger;
      console.error(err);
    }
  }
}
