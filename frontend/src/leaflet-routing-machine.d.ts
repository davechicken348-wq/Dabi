import "leaflet";

declare module "leaflet" {
  namespace Routing {
    interface LineStyle {
      color?: string;
      weight?: number;
      opacity?: number;
      dashArray?: string;
    }

    interface LineOptions {
      styles?: LineStyle[];
      extendToWaypoints?: boolean;
      missingRouteTolerance?: number;
    }

    interface RoutingControlOptions extends ControlOptions {
      waypoints?: LatLng[];
      lineOptions?: LineOptions;
      addWaypoints?: boolean;
      routeWhileDragging?: boolean;
      fitSelectedRoutes?: boolean;
      show?: boolean;
      collapsible?: boolean;
      createMarker?: (i: number, wp: unknown, n: number) => Marker | null;
    }

    function control(options?: RoutingControlOptions): any;
  }
}

declare module "leaflet-routing-machine";
