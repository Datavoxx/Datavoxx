interface GuestAllowedRouteProps {
  children: React.ReactNode;
}

const GuestAllowedRoute = ({ children }: GuestAllowedRouteProps) => {
  // This route allows both authenticated users and guests
  return <>{children}</>;
};

export default GuestAllowedRoute;
