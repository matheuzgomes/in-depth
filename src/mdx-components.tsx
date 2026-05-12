import type { MDXComponents } from "mdx/types"
import { CodeBlock } from "@/components/ui/CodeBlock"
import { Callout } from "@/components/ui/Callout"
import { BenchBar } from "@/components/ui/BenchBar"
import { VerdictGrid } from "@/components/ui/VerdictGrid"
import { SLabel } from "@/components/ui/SLabel"
import { SliceSimulation } from "@/components/ui/SliceSimulation"
import { DictLookupSimulation } from "@/components/ui/DictLookupSimulation"
import { PatternMatchingSimulation } from "@/components/ui/PatternMatchingSimulation"
import { SetMembershipSimulation } from "@/components/ui/SetMembershipSimulation"
import { ContainerComparisonLab } from "@/components/ui/ContainerComparisonLab"
import { SpecialMethodLab } from "@/components/ui/SpecialMethodLab"
import { BytecodeLab } from "@/components/ui/BytecodeLab"
import { GILLab } from "@/components/ui/GILLab"
import { AsyncTimelineLab } from "@/components/ui/AsyncTimelineLab"
import { CardRef } from "@/components/navigation/CardRef"
import { GuideLink } from "@/components/navigation/GuideLink"
import { LoopSimulation } from "@/components/ui/LoopSimulation"
import { T } from "@/lib/tokens"
import { ExternalLink } from "lucide-react"

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Override standard elements
    p: ({ children }) => <p style={{ marginBottom: 12 }}>{children}</p>,
    code: ({ children }) => (
      <code style={{
        fontFamily: "var(--font-mono)",
        background: "rgba(255, 255, 255, 0.04)",
        color: T.text1,
        padding: "2px 6px",
        borderRadius: 999,
        fontSize: "0.92em",
        border: `1px solid rgba(232,224,208,0.08)`,
      }}>
        {children}
      </code>
    ),
    pre: ({ children, ...props }) => {
      // Check if it contains a `code` element and extract its content
      // Since our CodeBlock component handles syntax highlighting, we just pass the raw text
      let codeString = ""
      if (typeof children === "string") {
        codeString = children
      } else if (
        children && 
        typeof children === "object" && 
        "props" in children && 
        children.props.children
      ) {
        codeString = children.props.children
      }

      return <CodeBlock code={codeString} {...props} />
    },
    strong: ({ children }) => <strong style={{ fontWeight: 650, color: T.text1 }}>{children}</strong>,
    a: ({ children, href, ...props }) => {
      const isExternal = typeof href === "string" && /^https?:\/\//.test(href)

      return (
        <a
          href={href}
          className="mdx-link"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
          title={isExternal ? "Open reference link" : undefined}
          {...props}
        >
          <span>{children}</span>
          {isExternal ? <ExternalLink aria-hidden="true" size={12} strokeWidth={2.4} /> : null}
        </a>
      )
    },
    
    // Custom UI components
    Callout,
    BenchBar,
    VerdictGrid,
    SLabel,
    SliceSimulation,
    DictLookupSimulation,
    PatternMatchingSimulation,
    SetMembershipSimulation,
    ContainerComparisonLab,
    SpecialMethodLab,
    BytecodeLab,
    GILLab,
    AsyncTimelineLab,
    CardRef,
    GuideLink,
    LoopSimulation,
    CodeBlock,
    
    ...components,
  }
}
