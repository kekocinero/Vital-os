import { Outlet, createFileRoute } from '@tanstack/react-router'

/** VITAL member-area route parent; the child owns its full-screen navigation. */
export const Route = createFileRoute('/app')({
  component: () => <Outlet />,
})
