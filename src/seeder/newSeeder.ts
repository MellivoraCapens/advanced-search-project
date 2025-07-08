import "dotenv/config";
import mongoose, { AnyBulkWriteOperation } from "mongoose";
import { fakerEN_US as faker } from "@faker-js/faker";
import DataModel from "../models/Data";
import { input } from "@inquirer/prompts";
import chalk from "chalk";

const CHUNK = 400;
const BULK_CHUNK_SIZE = 40;

const ROLE_ARRAY = [
  "Product Manager",
  "Product Owner",
  "Business Analyst",
  "Engineering Manager",
  "Software Architect",
  "Software Developers",
  "UX/UI Designers",
  "QA Engineer",
  "Scrum Master",
  "Tester",
  "Team Lead",
  "Tech Lead",
];

const LANGUAGES = [
  "Abkhazian",
  "Afar",
  "Afrikaans",
  "Akan",
  "Albanian",
  "Amharic",
  "Arabic",
  "Aragonese",
  "Armenian",
  "Assamese",
  "Avaric",
  "Avestan",
  "Aymara",
  "Azerbaijani",
  "Bambara",
  "Bashkir",
  "Basque",
  "Belarusian",
  "Bengali",
  "Bihari languages",
  "Bislama",
  "Bosnian",
  "Breton",
  "Bulgarian",
  "Burmese",
  "Catalan, Valencian",
  "Central Khmer",
  "Chamorro",
  "Chechen",
  "Chichewa, Chewa, Nyanja",
  "Chinese",
  "Church Slavonic, Old Bulgarian, Old Church Slavonic",
  "Chuvash",
  "Cornish",
  "Corsican",
  "Cree",
  "Croatian",
  "Czech",
  "Danish",
  "Divehi, Dhivehi, Maldivian",
  "Dutch, Flemish",
  "Dzongkha",
  "Esperanto",
  "Estonian",
  "Ewe",
  "Faroese",
  "Fijian",
  "Finnish",
  "French",
  "Fulah",
  "Gaelic, Scottish Gaelic",
  "Galician",
  "Ganda",
  "Georgian",
  "German",
  "Gikuyu, Kikuyu",
  "Greek (Modern)",
  "Greenlandic, Kalaallisut",
  "Guarani",
  "Gujarati",
  "Haitian, Haitian Creole",
  "Hausa",
  "Hebrew",
  "Herero",
  "Hindi",
  "Hiri Motu",
  "Hungarian",
  "Icelandic",
  "Ido",
  "Igbo",
  "Indonesian",
  "Interlingua (International Auxiliary Language Association)",
  "Interlingue",
  "Inuktitut",
  "Inupiaq",
  "Irish",
  "Italian",
  "Japanese",
  "Javanese",
  "Kannada",
  "Kanuri",
  "Kashmiri",
  "Kazakh",
  "Kinyarwanda",
  "Komi",
  "Kongo",
  "Korean",
  "Kwanyama, Kuanyama",
  "Kurdish",
  "Kyrgyz",
  "Lao",
  "Latin",
  "Latvian",
  "Letzeburgesch, Luxembourgish",
  "Limburgish, Limburgan, Limburger",
  "Lingala",
  "Lithuanian",
  "Luba-Katanga",
  "Macedonian",
  "Malagasy",
  "Malay",
  "Malayalam",
  "Maltese",
  "Manx",
  "Maori",
  "Marathi",
  "Marshallese",
  "Moldovan, Moldavian, Romanian",
  "Mongolian",
  "Nauru",
  "Navajo, Navaho",
  "Northern Ndebele",
  "Ndonga",
  "Nepali",
  "Northern Sami",
  "Norwegian",
  "Norwegian Bokmål",
  "Norwegian Nynorsk",
  "Nuosu, Sichuan Yi",
  "Occitan (post 1500)",
  "Ojibwa",
  "Oriya",
  "Oromo",
  "Ossetian, Ossetic",
  "Pali",
  "Panjabi, Punjabi",
  "Pashto, Pushto",
  "Persian",
  "Polish",
  "Portuguese",
  "Quechua",
  "Romansh",
  "Rundi",
  "Russian",
  "Samoan",
  "Sango",
  "Sanskrit",
  "Sardinian",
  "Serbian",
  "Shona",
  "Sindhi",
  "Sinhala, Sinhalese",
  "Slovak",
  "Slovenian",
  "Somali",
  "Sotho, Southern",
  "South Ndebele",
  "Spanish, Castilian",
  "Sundanese",
  "Swahili",
  "Swati",
  "Swedish",
  "Tagalog",
  "Tahitian",
  "Tajik",
  "Tamil",
  "Tatar",
  "Telugu",
  "Thai",
  "Tibetan",
  "Tigrinya",
  "Tonga (Tonga Islands)",
  "Tsonga",
  "Tswana",
  "Turkish",
  "Turkmen",
  "Twi",
  "Uighur, Uyghur",
  "Ukrainian",
  "Urdu",
  "Uzbek",
  "Venda",
  "Vietnamese",
  "Volap_k",
  "Walloon",
  "Welsh",
  "Western Frisian",
  "Wolof",
  "Xhosa",
  "Yiddish",
  "Yoruba",
  "Zhuang, Chuang",
  "Zulu",
];

const HOBBIES = [
  "3D printing",
  "Amateur radio",
  "Scrapbook",
  "Acting",
  "Baton twirling",
  "Board games",
  "Book restoration",
  "Cabaret",
  "Calligraphy",
  "Candle making",
  "Computer programming",
  "Coffee roasting",
  "Cooking",
  "Colouring",
  "Cosplaying",
  "Couponing",
  "Creative writing",
  "Crocheting",
  "Cryptography",
  "Dance",
  "Digital arts",
  "Drama",
  "Drawing",
  "Do it yourself",
  "Electronics",
  "Embroidery",
  "Fashion",
  "Flower arranging",
  "Foreign language learning",
  "Gaming",
  "Tabletop games",
  "Role-playing games",
  "Gambling",
  "Genealogy",
  "Glassblowing",
  "Gunsmithing",
  "Homebrewing",
  "Ice skating",
  "Jewelry making",
  "Jigsaw puzzles",
  "Juggling",
  "Knapping",
  "Knitting",
  "Kabaddi",
  "Knife making",
  "Lacemaking",
  "Lapidary",
  "Leather crafting",
  "Lego building",
  "Lockpicking",
  "Machining",
  "Macrame",
  "Metalworking",
  "Magic",
  "Model building",
  "Listening to music",
  "Origami",
  "Painting",
  "Playing musical instruments",
  "Pet",
  "Poi",
  "Pottery",
  "Puzzles",
  "Quilting",
  "Reading",
  "Scrapbooking",
  "Sculpting",
  "Sewing",
  "Singing",
  "Sketching",
  "Soapmaking",
  "Sports",
  "Stand-up comedy",
  "Sudoku",
  "Table tennis",
  "Taxidermy",
  "Video gaming",
  "Watching movies",
  "Web surfing",
  "Whittling",
  "Wood carving",
  "Woodworking",
  "World Building",
  "Writing",
  "Yoga",
  "Yo-yoing",
  "Air sports",
  "Archery",
  "Astronomy",
  "Backpacking",
  "Base jumping",
  "Baseball",
  "Basketball",
  "Beekeeping",
  "Bird watching",
  "Blacksmithing",
  "Board sports",
  "Bodybuilding",
  "Brazilian jiu-jitsu",
  "Community",
  "Cycling",
  "Dowsing",
  "Driving",
  "Fishing",
  "Flag football",
  "Flying",
  "Flying disc",
  "Foraging",
  "Gardening",
  "Geocaching",
  "Ghost hunting",
  "Graffiti",
  "Handball",
  "Hiking",
  "Hooping",
  "Horseback riding",
  "Hunting",
  "Inline skating",
  "Jogging",
  "Kayaking",
  "Kite flying",
  "Kitesurfing",
  "Larping",
  "Letterboxing",
  "Metal detecting",
  "Motor sports",
  "Mountain biking",
  "Mountaineering",
  "Mushroom hunting",
  "Mycology",
  "Netball",
  "Nordic skating",
  "Orienteering",
  "Paintball",
  "Parkour",
  "Photography",
  "Polo",
  "Rafting",
  "Rappelling",
  "Rock climbing",
  "Roller skating",
  "Rugby",
  "Running",
  "Sailing",
  "Sand art",
  "Scouting",
  "Scuba diving",
  "Sculling",
  "Rowing",
  "Shooting",
  "Shopping",
  "Skateboarding",
  "Skiing",
  "Skim Boarding",
  "Skydiving",
  "Slacklining",
  "Snowboarding",
  "Stone skipping",
  "Surfing",
  "Swimming",
  "Taekwondo",
  "Tai chi",
  "Urban exploration",
  "Vacation",
  "Vehicle restoration",
  "Water sports",
];

export async function Result<T, U = mongoose.mongo.MongoBulkWriteError>(
  promise: Promise<T>
): Promise<[U, undefined] | [null, T]> {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[U, undefined]>((err: U) => [err, undefined]);
}

function* chunks<T>(arr: T[], n: number) {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

async function getUserInput() {
  const [userInputErr, userInput] = await Result(
    input({
      message: "How many users should be created?",
      default: "0",
    })
  );

  if (userInputErr) {
    console.trace(
      chalk.red("* Something went wrong with getting the user input: "),
      userInputErr
    );
    process.exit(1);
  }

  if (Number.isNaN(+userInput)) {
    console.log(chalk.red("* User input must be a number!"));
    return await getUserInput();
  }

  return +userInput;
}

async function seeder() {
  const [connErr] = await Result(
    mongoose.connect(process.env.MONGO_URI as string, {
      // serverSelectionTimeoutMS: 1000,
    })
  );

  if (connErr) {
    console.trace(chalk.red("* Could not connect to mongodb: "), connErr);
    process.exit(1);
  }

  console.log(chalk.green("+ Connected to Database!"));
  console.log(chalk.bgCyan(">>>  * S E E D E R  A P P L I C A T I O N *  <<<"));

  const [userInputErr, userInput] = await Result(getUserInput());

  if (userInputErr || userInput === 0) {
    console.log(chalk.red("* No input was specified. Exiting."));
    process.exit(1);
  }

  let bulkArr: AnyBulkWriteOperation[] = [];
  let seedCount = userInput || 0;
  let insertedCount = 0;

  console.time("TOTAL_SEEDER");

  for (let i = 0; i < seedCount; i++) {
    if (i !== 0 && i % CHUNK === 0) {
      console.log(
        chalk.bgYellow(
          `+ Starting chunk write for iteration: ${i - CHUNK}-${i}.`
        )
      );
      const chunkPromises: Promise<mongoose.mongo.BulkWriteResult>[] = [];

      [...chunks(bulkArr, BULK_CHUNK_SIZE)].forEach((chunk) => {
        chunkPromises.push(DataModel.bulkWrite(chunk, { ordered: false }));
      });

      const results = await Promise.allSettled(chunkPromises);

      results.forEach((result) => {
        const item = results.indexOf(result) + 1;
        console.log(
          chalk.yellow(
            `- ${item}. item (${item * BULK_CHUNK_SIZE - BULK_CHUNK_SIZE}/${
              item * BULK_CHUNK_SIZE
            })`
          )
        );
        if (result.status === "rejected") {
          insertedCount += result.reason.result.insertedCount;
          console.log(
            chalk.red(
              `-- inserted ${result.reason.result.insertedCount} out of ${BULK_CHUNK_SIZE}`
            )
          );
        }

        if (result.status === "fulfilled") {
          insertedCount += result.value.insertedCount;
          console.log(
            chalk.green(`-- inserted all ${result.value.insertedCount}`)
          );
        }
      });

      bulkArr = [];
    }

    const birth = faker.date.birthdate({ mode: "age", min: 19, max: 65 });
    const sex = faker.person.sexType();
    const firstName = faker.person.firstName(sex);
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;
    const company = faker.company.name();
    const provider = `${company.toLowerCase().replace(/[^a-zA-Z]/g, "")}.com`;
    const email = faker.internet.email({
      firstName: firstName.toLowerCase(),
      lastName: lastName.toLowerCase(),
      provider: provider,
    });
    const languages = faker.helpers
      .arrayElements(LANGUAGES, { min: 0, max: 3 })
      .concat("English");
    const user = {
      fullName: fullName,
      email: email,
      sex: sex,
      birthdate: birth,
      hobbies: faker.helpers.arrayElements(HOBBIES, { min: 2, max: 5 }),
      languages: languages,
      company: company,
      role: faker.helpers.arrayElement(ROLE_ARRAY),
      description: faker.lorem.paragraphs({ min: 2, max: 5 }),
      experience: faker.lorem.lines({ min: 3, max: 13 }),
      education: faker.lorem.lines({ min: 1, max: 8 }),
      phoneNumber: faker.phone.number(),
      address: {
        city: faker.location.city(),
        state: faker.location.state(),
        streetAddress: faker.location.streetAddress(),
        zipCode: faker.location.zipCode(),
      },
      createdAt: faker.date.past({ years: 15 }),
    };
    bulkArr.push({
      insertOne: {
        document: user,
      },
    });
  }

  if (bulkArr.length < 1) {
    console.log(
      chalk.bgGreen(
        `- Finished seeding! Inserted ${insertedCount} documents out of ${userInput}!`
      )
    );
    console.timeEnd("TOTAL_SEEDER");
    process.exit(0);
  }

  console.log(
    chalk.bgYellow(
      `+ Starting chunk write for the remaining ${bulkArr.length} items.`
    )
  );

  const chunkPromises: Promise<mongoose.mongo.BulkWriteResult>[] = [];

  [...chunks(bulkArr, BULK_CHUNK_SIZE)].forEach((chunk) => {
    chunkPromises.push(DataModel.bulkWrite(chunk));
  });

  const results = await Promise.allSettled(chunkPromises);

  results.forEach((result) => {
    console.log(
      chalk.yellow(`- ${results.indexOf(result) + 1}. item of remaining items.`)
    );
    if (result.status === "rejected") {
      insertedCount += result.reason.result.insertedCount;
      console.log(
        chalk.red(
          `-- inserted ${result.reason.result.insertedCount} out of ${BULK_CHUNK_SIZE}`
        )
      );
    }

    if (result.status === "fulfilled") {
      insertedCount += result.value.insertedCount;
      console.log(chalk.green(`-- inserted all ${result.value.insertedCount}`));
    }
  });

  bulkArr = [];

  console.log(
    chalk.bgGreen(
      `+ Finished seeding! Inserted ${insertedCount} documents out of ${userInput}!`
    )
  );
  console.timeEnd("TOTAL_SEEDER");
  process.exit(0);
}

seeder();
