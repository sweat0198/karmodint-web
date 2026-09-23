export interface SolutionCover {
  slug: string
  imagePath: string
  alt: string
}

const SELECTION_DIR = 'public/images/solutions/selection'

/**
 * The chosen cover for each Solution, as recorded in `selection/selections.json`.
 *
 * Alt text describes what each image actually shows, not the prompt it was generated from.
 */
export const SOLUTION_COVERS: SolutionCover[] = [
  { slug: 'site-offices', imagePath: `${SELECTION_DIR}/21x9/site-offices.png`, alt: 'Portable site office cabin on concrete pads beside a UK construction site with a tower crane' },
  { slug: 'security-gatehouses-and-access-control', imagePath: `${SELECTION_DIR}/21x9/security-gatehouses-and-access-control.png`, alt: 'Grey security gatehouse cabin with a barrier arm at the vehicle entrance of a business park' },
  { slug: 'ticket-information-and-service-kiosks', imagePath: `${SELECTION_DIR}/21x9/ticket-information-and-service-kiosks.png`, alt: 'White GRP ticket kiosk with a staffed service window and queue rails on a stadium concourse' },
  { slug: 'canteens-and-break-rooms', imagePath: `${SELECTION_DIR}/21x9/canteens-and-break-rooms.png`, alt: 'Portable cabin break room with picnic benches outside in a construction compound' },
  { slug: 'welfare-and-wc-units', imagePath: `${SELECTION_DIR}/21x9/welfare-and-wc-units.png`, alt: 'Portable welfare cabin with frosted windows, access ramp and steps on a construction site' },
  { slug: 'high-security-cabins', imagePath: `${SELECTION_DIR}/21x9/high-security-cabins.png`, alt: 'Bullet-resistant security cabin with protective bollards at an industrial site checkpoint' },
  { slug: 'visitor-reception-and-sign-in', imagePath: `${SELECTION_DIR}/21x9/visitor-reception-and-sign-in.png`, alt: 'Composite reception cabin with a glazed desk window at a business campus car park entrance' },
  { slug: 'car-park-valet-and-weighbridge-cabins', imagePath: `${SELECTION_DIR}/21x9/car-park-valet-and-weighbridge-cabins.png`, alt: 'Car park attendant cabin between barrier arms on a kerbed island in a business park car park' },
  { slug: 'retail-and-food-service-kiosks', imagePath: `${SELECTION_DIR}/21x9/retail-and-food-service-kiosks.png`, alt: 'Coffee kiosk with an open serving hatch and planters on a paved public square' },
  { slug: 'garden-rooms-and-garden-offices', imagePath: `${SELECTION_DIR}/21x9/garden-rooms-and-garden-offices.png`, alt: 'Garden office cabin on a patio at the end of a landscaped back garden' },
  { slug: 'healthcare-and-consultation-rooms', imagePath: `${SELECTION_DIR}/21x9/healthcare-and-consultation-rooms.png`, alt: 'Portable consultation room with an accessible ramp beside a healthcare building' },
  { slug: 'accommodation-units', imagePath: `${SELECTION_DIR}/21x9/accommodation-units.png`, alt: 'Row of portable accommodation cabins on a gravel site with wind turbines on the hills behind' }
]
