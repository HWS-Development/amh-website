import React from 'react';
import { Plane, Train, Bus, Car } from 'lucide-react';

const slugify = (text) => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

export const destinationsData = {
  marrakech: {
    color: "#C14924",
    heroImage: "a stunning panoramic view of Marrakech's old city medina with the Koutoubia mosque at sunset",
    heroImageUrl: "https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/sign/amhimages/rotative/Marrakech_rota1.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZmUzOTdmNy0zMGUxLTQyMjktOGZhNC01ZTZhZGQ3MGE4NWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbWhpbWFnZXMvcm90YXRpdmUvTWFycmFrZWNoX3JvdGExLmpwZyIsImlhdCI6MTc1NDUwMDc3NCwiZXhwIjoyMDY5ODYwNzc0fQ.t8MPi000Llmo_LNpVtf5nTOI3aEguq3jPWuiUBFZpLA",
    themes: [
      { titleKey: "marrakech_theme_heritage", slug: "heritage-icons", image: "A close-up view of the Koutoubia minaret in Marrakech with the setting sun behind it" },
      { titleKey: "marrakech_theme_souks", slug: "souks-crafts", image: "A bustling Moroccan souk with colorful spices, traditional lamps, and artisan crafts" },
      { titleKey: "marrakech_theme_gardens", slug: "gardens-museums", image: "The vibrant blue and yellow architectural features of Jardin Majorelle with lush green plants" },
      { titleKey: "marrakech_theme_hammams", slug: "hammams-wellness", image: "A serene and luxurious hammam interior with steam and soft lighting, ready for a spa treatment" },
      { titleKey: "marrakech_theme_desert", slug: "desert-atlas", image: "A group of dromedary camels walking across golden sand dunes in the Agafay Desert at sunset, with the Atlas Mountains in the distance" }
    ],
    sections: {
      gettingHere: {
        titleKey: "getting_here",
        content: [
          { icon: Plane, textKey: "marrakech_getting_here_plane" },
          { icon: Train, textKey: "marrakech_getting_here_train" },
          { icon: Bus, textKey: "marrakech_getting_here_bus" },
          { icon: Car, textKey: "marrakech_getting_here_car" },
        ]
      },
      goodToKnow: {
        titleKey: "good_to_know",
        contentKey: "marrakech_good_to_know_content"
      },
      whatToDo: {
        titleKey: "what_to_do",
        contentKeys: [
          "marrakech_what_to_do_item1",
          "marrakech_what_to_do_item2",
          "marrakech_what_to_do_item3",
          "marrakech_what_to_do_item4"
        ],
        subsections: [
          { titleKey: "marrakech_subsection_flavours", textKey: "marrakech_subsection_flavours_text" }
        ]
      },
      whenToVisit: {
        titleKey: "when_to_visit",
        contentKey: "marrakech_when_to_visit_content"
      }
    },
    images: [
      "a vibrant and bustling souk in Marrakech with colorful spices and lanterns",
      "the serene blue Jardin Majorelle with exotic plants and fountains",
      "a traditional Moroccan tagine being served in a beautiful riad setting"
    ],
    faq: [
      { qKey: "marrakech_faq1_q", aKey: "marrakech_faq1_a" },
      { qKey: "marrakech_faq2_q", aKey: "marrakech_faq2_a" },
      { qKey: "marrakech_faq3_q", aKey: "marrakech_faq3_a" }
    ]
  },
  essaouira: {
    color: "#277DA1",
    heroImage: "panoramic view of Essaouira's historic ramparts and medina overlooking the Atlantic Ocean",
    heroImageUrl: "https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/sign/amhimages/rotative/Essaouira_rota1.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZmUzOTdmNy0zMGUxLTQyMjktOGZhNC01ZTZhZGQ3MGE4NWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbWhpbWFnZXMvcm90YXRpdmUvRXNzYW91aXJhX3JvdGExLmpwZyIsImlhdCI6MTc1NDUwMDcwOSwiZXhwIjo0OTA4MTAwNzA5fQ.Hkq7WQxYe2eBFS2MLUh8Erh2KbpHs3wCqvwRXAlKKNg",
    themes: [
        { titleKey: "essaouira_theme_beach", slug: "beach-surf", image: "Kitesurfers on the windy beach of Essaouira with turquoise waves and clear sky" },
        { titleKey: "essaouira_theme_ramparts", slug: "ramparts-medina", image: "The ancient stone ramparts of Essaouira with cannons facing the Atlantic Ocean at sunset, showing the blue-and-white medina" },
        { titleKey: "essaouira_theme_seafood", slug: "seafood-markets", image: "Freshly caught grilled sardines being prepared at the bustling port of Essaouira" },
        { titleKey: "essaouira_theme_art", slug: "art-music", image: "A traditional Gnaoua musician playing a guembri in a vibrant, artistic setting in Essaouira's medina" },
        { titleKey: "essaouira_theme_argan", slug: "argan-excursions", image: "Goats perched on an argan tree in the Moroccan countryside, symbolizing the argan oil production near Essaouira" }
    ],
    sections: {
      gettingHere: {
        titleKey: "getting_here",
        content: [
          { icon: Bus, textKey: "essaouira_getting_here_bus" },
          { icon: Plane, textKey: "essaouira_getting_here_plane" },
          { icon: Car, textKey: "essaouira_getting_here_car" },
        ]
      },
      goodToKnow: {
        titleKey: "good_to_know",
        contentKey: "essaouira_good_to_know_content"
      },
      whatToDo: {
        titleKey: "what_to_do",
        contentKeys: [
          "essaouira_what_to_do_item1",
          "essaouira_what_to_do_item2",
          "essaouira_what_to_do_item3",
          "essaouira_what_to_do_item4",
          "essaouira_what_to_do_item5"
        ],
        subsections: [
            { titleKey: "essaouira_subsection_snapshots", textKey: "essaouira_subsection_snapshots_text" },
            { titleKey: "essaouira_subsection_flavours", textKey: "essaouira_subsection_flavours_text" }
        ]
      },
      whenToVisit: {
        titleKey: "when_to_visit",
        contentKey: "essaouira_when_to_visit_content"
      }
    },
    images: [
      "a close-up of the iconic blue fishing boats in Essaouira's harbor",
      "an artisan carving intricate designs into thuya wood in a local workshop",
      "a group of people kitesurfing on the waves of the Atlantic at Essaouira beach"
    ],
    faq: [
      { qKey: "essaouira_faq1_q", aKey: "essaouira_faq1_a" },
      { qKey: "essaouira_faq2_q", aKey: "essaouira_faq2_a" },
      { qKey: "essaouira_faq3_q", aKey: "essaouira_faq3_a" }
    ]
  },
  ouarzazate: {
    color: "#D96C06",
    heroImage: "The famous Kasbah of Ait Benhaddou near Ouarzazate at sunrise, a UNESCO World Heritage site",
    heroImageUrl: "https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/sign/amhimages/rotative/Ouarzazate_rota1.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZmUzOTdmNy0zMGUxLTQyMjktOGZhNC01ZTZhZGQ3MGE4NWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbWhpbWFnZXMvcm90YXRpdmUvT3VhcnphemF0ZV9yb3RhMS5qcGVnIiwiaWF0IjoxNzU0NTAwNzk3LCJleHAiOjIwNjk4NjA3OTd9.ZVqwsDonRGgbRdfn0ilj8zO9srTzSbsCe65WwlfYb6E",
    themes: [],
    sections: {
       gettingHere: {
        titleKey: "getting_here",
        content: []
      },
      goodToKnow: {
        titleKey: "good_to_know",
        contentKey: ""
      },
      whatToDo: {
        titleKey: "what_to_do",
        contentKeys: [],
        subsections: []
      },
      whenToVisit: {
        titleKey: "when_to_visit",
        contentKey: ""
      }
    },
    images: [],
    faq: []
  }
};