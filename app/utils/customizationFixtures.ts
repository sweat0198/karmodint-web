/**
 * Demo data in exact Sanity `customizationGroup` shape, standing in for a real Studio-authored
 * catalogue until `/customize` fetches groups via `useSanityQuery` (see plan D3, D17).
 *
 * DELETE this file — and `CustomizationImage.vue`'s fixture lookup — once that fetch is wired.
 */
import type { SanityCustomizationGroup } from "~/types/catalog";

export const FIXTURE_ASSET_URLS: Record<string, string> = {
  "image-fixture-ral9002-png": "/images/product-service-cabin-135.png",
  "image-fixture-ral7016-png": "/images/product-security-cabin-110.png",
  "image-fixture-timber-clad-png": "/images/product-container-k2004.png",
};

// Declared out of displayOrder order on purpose — proves the dispatcher sorts by displayOrder
// rather than relying on array order (see plan Task 4 step 1, Task 6 step 1).
export const DEMO_CUSTOMIZATION_GROUPS: SanityCustomizationGroup[] = [
  {
    _id: "fixture-air-conditioning",
    _type: "customizationGroup",
    title: "Air Conditioning",
    identifier: "air-conditioning",
    selectionType: "boolean",
    isMandatory: false,
    description: "Add a 9,000 BTU inverter AC / heat pump unit.",
    displayOrder: 40,
    items: [
      {
        _key: "ac-inverter-unit",
        title: "9,000 BTU Inverter AC / Heat Pump",
        pricingType: "fixed",
        price: 1150,
      },
    ],
  },
  {
    _id: "fixture-electrical-package",
    _type: "customizationGroup",
    title: "Electrical Package",
    identifier: "electrical-package",
    selectionType: "single",
    isMandatory: false,
    description: "Pick a standard package, or describe a custom electrical layout.",
    displayOrder: 20,
    items: [
      {
        _key: "elec-standard",
        title: "Standard Package: 1x LED Panel + 2x Twin 13A Sockets + RCD Consumer Unit",
        pricingType: "included",
      },
      {
        _key: "elec-comfort",
        title: "Comfort Pack: High Output LED + 2kW Wall Convector Heater + 4x Twin Sockets",
        pricingType: "fixed",
        price: 490,
      },
      {
        _key: "elec-custom",
        title: "Custom Electrical Layout",
        pricingType: "poa",
        requiresTextInput: true,
        textInputPlaceholder: "Describe your custom electrical requirements...",
      },
    ],
  },
  {
    _id: "fixture-exterior-finish",
    _type: "customizationGroup",
    title: "Exterior Wall Finish",
    identifier: "exterior-finish",
    selectionType: "single",
    isMandatory: true,
    description: "Choose the RAL colour or cladding for the exterior walls.",
    displayOrder: 10,
    items: [
      {
        _key: "finish-white-9002",
        title: "Standard White (RAL 9002)",
        pricingType: "included",
        description: "The default finish, included in the base price.",
        image: {
          _type: "image",
          asset: { _ref: "image-fixture-ral9002-png", _type: "reference" },
        },
      },
      {
        _key: "finish-anthracite-7016",
        title: "Anthracite Grey (RAL 7016)",
        pricingType: "fixed",
        price: 320,
        image: {
          _type: "image",
          asset: { _ref: "image-fixture-ral7016-png", _type: "reference" },
        },
      },
      {
        _key: "finish-timber-clad",
        title: "Architectural Timber Slat",
        pricingType: "fixed",
        price: 780,
        image: {
          _type: "image",
          asset: { _ref: "image-fixture-timber-clad-png", _type: "reference" },
        },
      },
    ],
  },
  {
    _id: "fixture-security-glazing",
    _type: "customizationGroup",
    title: "Security Glazing & Access",
    identifier: "security-glazing",
    selectionType: "multiple",
    isMandatory: false,
    description: "Add any combination of glazing and access upgrades.",
    displayOrder: 30,
    items: [
      {
        _key: "glazing-roller-shutter",
        title: "Heavy Duty Security Roller Shutter",
        pricingType: "fixed",
        price: 295,
      },
      {
        _key: "glazing-double-glazed",
        title: "Thermal Low-E Double Glazed Acoustic Glass",
        pricingType: "fixed",
        price: 220,
      },
      {
        _key: "glazing-rain-canopy",
        title: "Overhead Weather Protection Rain Canopy",
        pricingType: "fixed",
        price: 160,
      },
    ],
  },
];
