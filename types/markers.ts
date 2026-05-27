export interface JobMarker {
  jobType: string;
  status?: string;
  review: string;
  location: [number, number];
}
