import React from 'react';
export const usePathname = () => '/' + (new URLSearchParams(location.search).get('page') || 'dashboard');
export const useRouter = () => ({push: () => {}, replace: () => {}, back: () => {}});
export default function Link({href, children, ...props}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} href={'?page=' + String(href).replace(/^\//, '')}>{children}</a>;
}
