import React, { cloneElement, forwardRef } from 'react'

import { preserveRef } from './utils'

const createTippyWrapper = (Tippy, defaultProps) =>
    forwardRef(function TippyWrapper({ children, ...props }, ref) {
        return (
            // If I spread them separately here, Babel adds the _extends ponyfill for
            // some reason
            <Tippy {...{ ...defaultProps, ...props }}>
                {children
                    ? cloneElement(children, {
                          ref(node) {
                              preserveRef(ref, node)
                              preserveRef(children.props?.ref, node)
                          },
                      })
                    : null}
            </Tippy>
        )
    })

export default createTippyWrapper
