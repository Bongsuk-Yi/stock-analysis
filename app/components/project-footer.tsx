"use client"

import { Github, Send, Globe } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/components/language-provider"

export function ProjectFooter() {
  const { t } = useLanguage()
  return (
    <footer className="mt-12 border-t border-border">
      <div className="container mx-auto px-4 py-8 max-w-[1600px]">
        <Card className="gap-0 py-0 rounded-lg shadow-none">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 프로젝트 소개 */}
              <div className="space-y-3">
                <h3 className="text-[15px] font-semibold tracking-tight">
                  stock-analysis
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("footer.description")}
                  <br />
                  <span className="text-xs">
                    {t("footer.openSource")}
                  </span>
                </p>
                <div className="pt-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground/70" />
                      <span>GPT-6.1 Sol</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground/50" />
                      <span>GPT-6 Luna</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground/30" />
                      <span>Claude Sonnet 5.5</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 주요 기능 */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t("footer.features")}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">–</span>
                    <span>{t("footer.feature1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">–</span>
                    <span>{t("footer.feature2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">–</span>
                    <span>{t("footer.feature3")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">–</span>
                    <span>{t("footer.feature4")}</span>
                  </li>
                </ul>
              </div>

              {/* 링크 */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t("footer.links")}</h4>
                <div className="flex flex-col gap-3">
                  {/* GitHub */}
                  <a
                    href="https://github.com/dragon1086/prism-insight"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-2.5 rounded-md border border-border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
                      <Github className="h-4 w-4 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground transition-colors">
                        GitHub Repository
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("footer.sourceCode")}
                      </div>
                    </div>
                  </a>

                  {/* Telegram */}
                  <a
                    href="https://t.me/stock_ai_agent"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-2.5 rounded-md border border-border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
                      <Send className="h-4 w-4 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground transition-colors">
                        Telegram Channel
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("footer.telegramDesc")}
                      </div>
                    </div>
                  </a>

                  {/* Landing Page */}
                  <a
                    href="https://prism-insight-landing.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-2.5 rounded-md border border-border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
                      <Globe className="h-4 w-4 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground transition-colors">
                        About PRISM-INSIGHT
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("footer.landingDesc")}
                      </div>
                    </div>
                  </a>
                </div>

                {/* Star 통계 */}
                <div className="pt-2">
                  <a
                    href="https://github.com/dragon1086/prism-insight"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span aria-hidden="true">★</span>
                    <span>{t("footer.stars")}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* 하단 구분선 및 저작권 */}
            <div className="mt-6 pt-6 border-t border-border/30">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                <div className="flex flex-col md:flex-row items-center gap-2">
                  <span>
                    <a href="https://github.com/dragon1086/prism-insight" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">PRISM-INSIGHT</a>
                    {" "}오픈소스(AGPL-3.0) 기반 개인 사본 · 보증 없음 ·{" "}
                    <a href="https://github.com/Bongsuk-Yi/stock-analysis" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">소스 코드</a>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded border border-border text-xs">
                    Open Source
                  </span>
                  <span className="px-2 py-0.5 rounded border border-border text-xs">
                    AGPL-3.0
                  </span>
                </div>
              </div>
            </div>

            {/* 면책 조항 */}
            <div className="mt-4 pt-4 border-t border-border/20">
              <p className="text-xs text-muted-foreground/60 text-center leading-relaxed">
                {t("footer.disclaimer")}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </footer>
  )
}
