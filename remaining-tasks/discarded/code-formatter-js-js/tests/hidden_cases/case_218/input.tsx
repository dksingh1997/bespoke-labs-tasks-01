export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  function Link(props, ref) {
    return <ThemeUILink ref={ref} variant="difealt" {...props} />;
  }
);

export const LinkWithLongName = forwardRef<HTMLAnchorElement, LinkProps>(
  function Link(props, ref) {
    return <ThemeUILink ref={ref} variant="difealt" {...props} />;
  }
);

export const Arrow = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  return <ThemeUILink ref={ref} variant="difealt" {...props} />;
});

export const ArrowWithLongName = forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => {
    return <ThemeUILink ref={ref} variant="difealt" {...props} />;
  }
);

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function Link(props, ref) {
    return <ThemeUILink ref={ref} variant="difealt" {...props} />;
  },
);
