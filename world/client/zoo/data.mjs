export const SECTIONS = [
  {
    "id": "savanna",
    "name": "Savanna Safari",
    "intro": "Walk into the sunshine. Five amazing grassland animals are waiting for you.",
    "water": false
  },
  {
    "id": "rainforest",
    "name": "Rainforest Trail",
    "intro": "Follow the leafy path. Look high in the trees and down in the shadows.",
    "water": false
  },
  {
    "id": "birds",
    "name": "Bird Gardens",
    "intro": "Listen and look around. Birds have many colors, calls, and ways to move.",
    "water": false
  },
  {
    "id": "reptiles",
    "name": "Reptile River",
    "intro": "Explore the warm reptile house. Our frog friend is an amphibian neighbor.",
    "water": false
  },
  {
    "id": "reef",
    "name": "Coral Reef",
    "intro": "Step into our glowing aquarium. Look between the corals for five ocean friends.",
    "water": true
  },
  {
    "id": "ocean",
    "name": "Ocean Tunnel",
    "intro": "Walk beneath the blue water. Meet ocean swimmers and coastal neighbors.",
    "water": true
  }
];
export const ANIMALS = [
  {
    "id": "giraffe",
    "name": "Giraffe",
    "section": "savanna",
    "description": "I am the tallest animal on land. My long neck helps me reach leaves high in the trees. Can you stretch up tall like me?",
    "diet": "Leaves",
    "soundLabel": "Hum",
    "sound": "hum",
    "video": {
      "url": "https://www.youtube.com/watch?v=VSGy007Awzg",
      "id": "VSGy007Awzg",
      "start": 49,
      "end": 79
    },
    "x": 15,
    "y": 25
  },
  {
    "id": "african-elephant",
    "name": "African elephant",
    "section": "savanna",
    "description": "My trunk helps me smell, drink, and pick things up. I live with my family in a herd. Can you swing your arm like a trunk?",
    "diet": "Grass and leaves",
    "soundLabel": "Trumpet",
    "sound": "trumpet",
    "video": {
      "url": "https://www.youtube.com/watch?v=VSGy007Awzg",
      "id": "VSGy007Awzg",
      "start": 309,
      "end": 339
    },
    "x": 48,
    "y": 27
  },
  {
    "id": "zebra",
    "name": "Zebra",
    "section": "savanna",
    "description": "Look at my black and white stripes! Each zebra has its own stripe pattern. Can you find two stripes on my body?",
    "diet": "Grass",
    "soundLabel": "Bray",
    "sound": "bray",
    "video": {
      "url": "https://www.youtube.com/watch?v=7k3n56h41KQ",
      "id": "7k3n56h41KQ",
      "start": 0,
      "end": 60
    },
    "x": 82,
    "y": 29
  },
  {
    "id": "lion",
    "name": "Lion",
    "section": "savanna",
    "description": "I am a big cat. Lions live in groups called prides. I rest a lot during the day. Can you make a gentle roar?",
    "diet": "Meat",
    "soundLabel": "Roar",
    "sound": "roar",
    "video": {
      "url": "https://www.youtube.com/watch?v=VSGy007Awzg",
      "id": "VSGy007Awzg",
      "start": 29,
      "end": 59
    },
    "x": 28,
    "y": 59
  },
  {
    "id": "rhinoceros",
    "name": "Rhinoceros",
    "section": "savanna",
    "description": "I have thick skin and a horn on my nose. My horn is made from keratin, like your fingernails. I munch on plants.",
    "diet": "Plants",
    "soundLabel": "Snort",
    "sound": "snort",
    "video": {
      "url": "https://www.youtube.com/watch?v=u5agqu2pSmI",
      "id": "u5agqu2pSmI",
      "start": 0,
      "end": 60
    },
    "x": 77,
    "y": 60
  },
  {
    "id": "gorilla",
    "name": "Gorilla",
    "section": "rainforest",
    "description": "I am an ape with strong arms. I eat many plants and live in a family group. Can you walk slowly on your hands and feet?",
    "diet": "Leaves and fruit",
    "soundLabel": "Grunt",
    "sound": "grunt",
    "video": {
      "url": "https://www.youtube.com/watch?v=g3KFZdihLMg",
      "id": "g3KFZdihLMg",
      "start": 0,
      "end": 60
    },
    "x": 17,
    "y": 21
  },
  {
    "id": "orangutan",
    "name": "Orangutan",
    "section": "rainforest",
    "description": "My long arms help me travel through the trees. I build a leafy nest to sleep in. Can you pretend to make a cozy nest?",
    "diet": "Fruit and leaves",
    "soundLabel": "Call",
    "sound": "hoot",
    "video": {
      "url": "https://www.youtube.com/watch?v=weBflupagT0",
      "id": "weBflupagT0",
      "start": 0,
      "end": 60
    },
    "x": 49,
    "y": 24
  },
  {
    "id": "tiger",
    "name": "Tiger",
    "section": "rainforest",
    "description": "My stripes help me blend into tall grass and shadows. I am a big cat, and I can swim. Can you creep quietly like a tiger?",
    "diet": "Meat",
    "soundLabel": "Growl",
    "sound": "roar",
    "video": {
      "url": "https://zooinstitutes.com/video/malayan-tiger-1239.html",
      "id": null,
      "start": 0,
      "end": 60
    },
    "x": 82,
    "y": 23
  },
  {
    "id": "sloth",
    "name": "Sloth",
    "section": "rainforest",
    "description": "I spend much of my life hanging in trees. I move slowly and hold on with long curved claws. Let us move in slow motion!",
    "diet": "Leaves",
    "soundLabel": "Soft call",
    "sound": "squeak",
    "video": {
      "url": "https://www.youtube.com/watch?v=ZuHroVftvvA",
      "id": "ZuHroVftvvA",
      "start": 0,
      "end": 60
    },
    "x": 31,
    "y": 54
  },
  {
    "id": "toucan",
    "name": "Toucan",
    "section": "rainforest",
    "description": "My colorful bill is big but surprisingly light. I use it to reach fruit. Can you point to my bright bill?",
    "diet": "Fruit",
    "soundLabel": "Croak",
    "sound": "croak",
    "video": {
      "url": "https://www.youtube.com/watch?v=g_YQG0iOEfw",
      "id": "g_YQG0iOEfw",
      "start": 0,
      "end": 60
    },
    "x": 75,
    "y": 55
  },
  {
    "id": "flamingo",
    "name": "Flamingo",
    "section": "birds",
    "description": "I wade in shallow water on long legs. The food I eat helps turn my feathers pink. Can you balance safely on one foot?",
    "diet": "Algae and tiny water animals",
    "soundLabel": "Honk",
    "sound": "honk",
    "video": {
      "url": "https://www.youtube.com/watch?v=3IA_HRxnQSA",
      "id": "3IA_HRxnQSA",
      "start": 0,
      "end": 60
    },
    "x": 17,
    "y": 29
  },
  {
    "id": "peacock",
    "name": "Peacock",
    "section": "birds",
    "description": "I am a male peafowl. I can spread my long colorful feathers into a huge fan. Can you open your arms wide like my fan?",
    "diet": "Seeds and insects",
    "soundLabel": "Call",
    "sound": "squawk",
    "video": {
      "url": "https://www.youtube.com/watch?v=pfewwFuD97o",
      "id": "pfewwFuD97o",
      "start": 0,
      "end": 60
    },
    "x": 49,
    "y": 29
  },
  {
    "id": "scarlet-macaw",
    "name": "Scarlet macaw",
    "section": "birds",
    "description": "I am a colorful parrot. My strong curved beak can crack nuts and seeds. Look for red, yellow, and blue in my feathers.",
    "diet": "Fruit, nuts and seeds",
    "soundLabel": "Squawk",
    "sound": "squawk",
    "video": {
      "url": "https://zfc.jp/en/video/6GnXBmtTl9g",
      "id": null,
      "start": 0,
      "end": 60
    },
    "x": 88,
    "y": 26
  },
  {
    "id": "snowy-owl",
    "name": "Snowy owl",
    "section": "birds",
    "description": "My thick feathers help keep me warm in the Arctic. I have bright yellow eyes. Can you turn your head slowly to look around?",
    "diet": "Small animals",
    "soundLabel": "Hoot",
    "sound": "hoot",
    "video": {
      "url": "https://www.nfb.ca/film/hinterland_who_s_who_the_snowy_owl/",
      "id": null,
      "start": 0,
      "end": 60
    },
    "x": 26,
    "y": 63
  },
  {
    "id": "penguin",
    "name": "Penguin",
    "section": "birds",
    "description": "I am a bird, but I do not fly through the air. My flippers help me swim underwater. Can you waddle like me?",
    "diet": "Fish",
    "soundLabel": "Honk",
    "sound": "honk",
    "video": {
      "url": "https://www.youtube.com/watch?v=VSGy007Awzg",
      "id": "VSGy007Awzg",
      "start": 489,
      "end": 519
    },
    "x": 70,
    "y": 64
  },
  {
    "id": "crocodile",
    "name": "Crocodile",
    "section": "reptiles",
    "description": "My eyes and nostrils sit high on my head. I can watch and breathe while most of my body stays underwater. Watch me from a safe distance.",
    "diet": "Fish and other animals",
    "soundLabel": "Rumble",
    "sound": "grunt",
    "video": {
      "url": "https://www.youtube.com/watch?v=sJHk_kG3jOo",
      "id": "sJHk_kG3jOo",
      "start": 0,
      "end": 60
    },
    "x": 17,
    "y": 24
  },
  {
    "id": "giant-tortoise",
    "name": "Giant tortoise",
    "section": "reptiles",
    "description": "My shell is part of my body. It helps protect me. I walk on sturdy legs and eat plants. Can you take three slow steps?",
    "diet": "Plants",
    "soundLabel": "Breathing",
    "sound": "snort",
    "video": {
      "url": "https://www.abc.net.au/abckids/programs/big-teds-big-adventure/video/giant-tortoise/11257002",
      "id": null,
      "start": 0,
      "end": 60
    },
    "x": 52,
    "y": 26
  },
  {
    "id": "green-tree-python",
    "name": "Green tree python",
    "section": "reptiles",
    "description": "I curl around branches to rest. My tongue helps me collect smells from the air. Can you make a long winding snake shape with your arm?",
    "diet": "Small animals",
    "soundLabel": "Hiss",
    "sound": "hiss",
    "video": {
      "url": "https://www.youtube.com/watch?v=W79MvuOxPnk",
      "id": "W79MvuOxPnk",
      "start": 0,
      "end": 60
    },
    "x": 87,
    "y": 23
  },
  {
    "id": "chameleon",
    "name": "Chameleon",
    "section": "reptiles",
    "description": "My eyes can look in different directions. My curling tail helps me hold a branch. Can you find my curly tail?",
    "diet": "Insects",
    "soundLabel": "Quiet habitat",
    "sound": "quiet",
    "video": {
      "url": "https://www.pbs.org/video/animal-adaptations-chameleon-and-blue-and-gold-macaw-dwbtvf/",
      "id": null,
      "start": 0,
      "end": 60
    },
    "x": 27,
    "y": 57
  },
  {
    "id": "tree-frog",
    "name": "Tree frog",
    "section": "reptiles",
    "description": "My toe pads help me hold on to leaves and branches. I am an amphibian, not a reptile. Can you make a tiny frog hop?",
    "diet": "Insects",
    "soundLabel": "Croak",
    "sound": "croak",
    "video": {
      "url": "https://www.nps.gov/media/video/view.htm?id=CBFE275E-FE69-DB79-0EA53F95D2762F6B",
      "id": null,
      "start": 0,
      "end": 60
    },
    "x": 79,
    "y": 58
  },
  {
    "id": "clownfish",
    "name": "Clownfish",
    "section": "reef",
    "description": "I live near the waving tentacles of a sea anemone. Special mucus on my skin helps protect me. Count the white bands on my body.",
    "diet": "Tiny animals and algae",
    "soundLabel": "Reef water",
    "sound": "water",
    "video": {
      "url": "https://fluvalaquatics.com/us/videos/colorful-clownfish-shorts",
      "id": null,
      "start": 0,
      "end": 60
    },
    "x": 14,
    "y": 18
  },
  {
    "id": "blue-tang",
    "name": "Blue tang",
    "section": "reef",
    "description": "I am a bright blue reef fish with a yellow tail. I nibble on algae around the reef. Can you find something blue near you?",
    "diet": "Algae and tiny animals",
    "soundLabel": "Reef water",
    "sound": "water",
    "video": {
      "url": "https://www.youtube.com/watch?v=vRHr3XMB03I",
      "id": "vRHr3XMB03I",
      "start": 0,
      "end": 60
    },
    "x": 49,
    "y": 21
  },
  {
    "id": "seahorse",
    "name": "Seahorse",
    "section": "reef",
    "description": "I am a fish that swims upright. My tail can hold on to sea grass. A father seahorse carries the eggs in a special pouch.",
    "diet": "Tiny crustaceans",
    "soundLabel": "Gentle water",
    "sound": "water",
    "video": {
      "url": "https://www.youtube.com/watch?v=XqP0xqbnAMU",
      "id": "XqP0xqbnAMU",
      "start": 0,
      "end": 60
    },
    "x": 86,
    "y": 18
  },
  {
    "id": "octopus",
    "name": "Octopus",
    "section": "reef",
    "description": "I have eight arms with suckers. I can change my color and squeeze through small spaces. Can you count to eight?",
    "diet": "Crabs and shellfish",
    "soundLabel": "Gentle water",
    "sound": "water",
    "video": {
      "url": "https://www.youtube.com/watch?v=9vQnKO_2kKk",
      "id": "9vQnKO_2kKk",
      "start": 0,
      "end": 60
    },
    "x": 22,
    "y": 59
  },
  {
    "id": "sea-turtle",
    "name": "Sea turtle",
    "section": "reef",
    "description": "I breathe air, even though I spend most of my time in the sea. My flippers help me swim. Can you glide your arms like flippers?",
    "diet": "Sea grass, algae and other food, depending on species",
    "soundLabel": "Ocean water",
    "sound": "water",
    "video": {
      "url": "https://tnaqua.org/at-the-aquarium/oscar-the-green-sea-turtle-is-starting-his-months-long-pool-party/",
      "id": null,
      "start": 0,
      "end": 60
    },
    "x": 82,
    "y": 58
  },
  {
    "id": "hammerhead-shark",
    "name": "Hammerhead shark",
    "section": "ocean",
    "description": "My wide head helps me sense the world around me. Sharks have skeletons made of cartilage instead of bone. Can you point to the wide sides of my head?",
    "diet": "Fish and rays",
    "soundLabel": "Ocean water",
    "sound": "water",
    "video": {
      "url": "https://www.youtube.com/watch?v=rG4jSz_2HDY",
      "id": "rG4jSz_2HDY",
      "start": 0,
      "end": 60
    },
    "x": 16,
    "y": 17
  },
  {
    "id": "manta-ray",
    "name": "Manta ray",
    "section": "ocean",
    "description": "My wide fins move like wings underwater. I filter tiny food called plankton from the water. Stretch out your arms and glide with me.",
    "diet": "Plankton",
    "soundLabel": "Ocean water",
    "sound": "water",
    "video": {
      "url": "https://www.youtube.com/watch?v=J38_m0D_p2s",
      "id": "J38_m0D_p2s",
      "start": 0,
      "end": 60
    },
    "x": 49,
    "y": 17
  },
  {
    "id": "moon-jellyfish",
    "name": "Moon jellyfish",
    "section": "ocean",
    "description": "My soft body looks like a floating umbrella. I drift and pulse through the water. I have no bones and no brain. Can you move gently like a jelly?",
    "diet": "Tiny drifting animals",
    "soundLabel": "Gentle water",
    "sound": "water",
    "video": {
      "url": "https://www.montereybayaquarium.org/cams-videos/live-cams/moon-jelly-cam",
      "id": null,
      "start": 0,
      "end": 60
    },
    "x": 89,
    "y": 17
  },
  {
    "id": "sea-otter",
    "name": "Sea otter",
    "section": "ocean",
    "description": "My thick fur helps me stay warm. I often float on my back. Some sea otters use rocks to open shellfish. Pretend your tummy is a little table!",
    "diet": "Shellfish and other sea animals",
    "soundLabel": "Squeak",
    "sound": "squeak",
    "video": {
      "url": "https://www.youtube.com/watch?v=piR7rXl1PBo",
      "id": "piR7rXl1PBo",
      "start": 0,
      "end": 60
    },
    "x": 22,
    "y": 66
  },
  {
    "id": "harbor-seal",
    "name": "Harbor seal",
    "section": "ocean",
    "description": "My flippers help me swim, and my whiskers help me find food. I come to the surface to breathe air. Can you spot my whiskers?",
    "diet": "Fish",
    "soundLabel": "Grunt",
    "sound": "grunt",
    "video": {
      "url": "https://www.neaq.org/exhibit/atlantic-harbor-seals/",
      "id": null,
      "start": 0,
      "end": 60
    },
    "x": 86,
    "y": 65
  }
];
export function nextAnimal(id,delta=1){const i=ANIMALS.findIndex(a=>a.id===id);return ANIMALS[(i+delta+ANIMALS.length)%ANIMALS.length];}
