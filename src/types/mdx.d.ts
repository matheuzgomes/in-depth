declare module "*.mdx" {
  import type { ReactNode } from "react"
  
  // Define the props that the MDX component might receive.
  // In our case, some receive the 'nav' context.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MDXComponent: (props: any) => ReactNode
  export default MDXComponent
}
