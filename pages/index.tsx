import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-xl text-center justify-center">
          <span className={title()}>ATLAS&nbsp;</span>
          <span className={title({ color: "yellow" })}>warehouse&nbsp;</span>
          <br />
          <span className={title()}>
            sistema industrial de almoxarifado
          </span>
          <div className={subtitle({ class: "mt-4" })}>
            Rapído, Confiável e estavél.
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            isExternal
            className={buttonStyles({
              color: "success",
              radius: "full",
              variant: "shadow",
            })}
            href={siteConfig.links.login}
          >
            Crie sua conta gratís
          </Link>
          <Link
            isExternal
            className={buttonStyles({ variant: "bordered", radius: "full" })}
            href={siteConfig.links.github}
          >
            <GithubIcon size={20} />
            GitHub
          </Link>
        </div>

        <div className="mt-8">
          <Snippet hideCopyButton hideSymbol variant="bordered">
            <span>
              Projeto feito por {" "}
              <Code color="primary">VurseDev</Code>
            </span>
          </Snippet>
        </div>
      </section>
    </DefaultLayout>
  );
}
