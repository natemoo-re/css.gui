import { HTMLAttributes, ReactNode } from 'react'
import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/router'

export const NavItem = ({
  children,
  href,
  ...props
}: LinkProps & { children: ReactNode }) => {
  const router = useRouter()
  const isActive = router.asPath === href
  return (
    <Link passHref={true} href={href} {...props}>
      <a
        sx={{
          fontSize: 2,
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '.5rem',
          width: '100%',
          color: isActive ? 'background' : 'muted',
          backgroundColor: isActive ? 'primary' : 'background',
          px: [2, 3, 4],
          py: 2,
          transition: 'color .2s ease-in-out',
          ':hover': {
            color: isActive ? 'background' : 'primary',
          },
        }}
      >
        {children}
      </a>
    </Link>
  )
}

export const NavSectionTitle = (props: HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3
      sx={{
        lineHeight: '1.25',
        fontWeight: 500,
        fontSize: 2,
        pt: [2, 3],
        pb: 1,
        px: [2, 3, 4],
        m: 0,
      }}
      {...props}
    />
  )
}
