import * as React from "react";

export function Footer() {
  return (
      <footer className="absolute border-t border-ui-border-base w-full bg-grayBg rounded-3xl">
          <div className="container flex flex-col w-full">
              <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-20">
                  <a
                      className={"text-2xl font-bold text-ui-fg-subtle hover:text-ui-fg-base"}
                      href={"/"}
                  >
                      TheBakerz
                  </a>
                  <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
                      <div className="flex flex-col gap-y-2">
                          <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                              <li>
                                  <a
                                      href="/create"
                                      target="_blank"
                                      rel="noreferrer"
                                      className="hover:text-ui-fg-base"
                                  >
                                      Create a bakery account
                                  </a>
                              </li>
                              <li>
                                  <a
                                      href="/"
                                      target="_blank"
                                      rel="noreferrer"
                                      className="hover:text-ui-fg-base"
                                  >
                                      Pricing
                                  </a>
                              </li>
                              <li>
                                  <a
                                      href="/"
                                      target="_blank"
                                      rel="noreferrer"
                                      className="hover:text-ui-fg-base"
                                  >
                                      About TheBakerz
                                  </a>
                              </li>
                              <li>
                                  <a
                                      href="/support"
                                      target="_blank"
                                      rel="noreferrer"
                                      className="hover:text-ui-fg-base"
                                  >
                                      Get Help
                                  </a>
                              </li>
                          </ul>
                      </div>
                      <div className="flex flex-col gap-y-2">
                          <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                              <li>
                                  <a
                                      href="/privacy"
                                      target="_blank"
                                      rel="noreferrer"
                                      className="hover:text-ui-fg-base"
                                  >
                                      Privacy Policy
                                  </a>
                              </li>
                              <li>
                                  <a
                                      href="/terms"
                                      target="_blank"
                                      rel="noreferrer"
                                      className="hover:text-ui-fg-base"
                                  >
                                      Terms of Use
                                  </a>
                              </li>
                          </ul>
                      </div>
                  </div>
              </div>
              <div className="flex w-full mb-16 justify-between text-ui-fg-muted">
                  <p className="font-normal font-sans txt-medium txt-compact-small">
                      © {new Date().getFullYear()} TheBakerz. All rights reserved.
                  </p>
              </div>
          </div>
      </footer>
  )
}