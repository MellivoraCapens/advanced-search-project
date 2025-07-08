import { fakerEN_US } from "@faker-js/faker";
import mongoose from "mongoose";
import "dotenv/config";
import Data from "../models/Data";
import { input } from "@inquirer/prompts";

let seedCount: number = 0;

const faker = fakerEN_US;

const getSeedCount = async () => {
  try {
    const answer = await input({
      message: "How many users should be created?",
      default: "0",
    });

    if (Number.isNaN(+answer)) {
      console.log("Is not a number");
      getSeedCount();
    }
    seedCount = +answer;
    seedData();
  } catch (err) {
    console.error(err);
  }
};

const seedData = () => {
  mongoose.set("strictQuery", false);
  mongoose
    .connect(process.env.MONGO_URI as string, {
      serverSelectionTimeoutMS: 100,
    })
    .then(async () => {
      console.log("Connected to DataBase");
      let doneCount: number = 0;
      const twirlTimer = (() => {
        var P = ["\\", "|", "/", "-"];
        var x = 0;
        return setInterval(() => {
          process.stdout.write(
            ` %${Number(((doneCount / seedCount) * 100).toFixed())} ` +
              "\r" +
              P[x++]
          );
          x &= 3;
        }, 250);
      })();

      twirlTimer;
      for (let i = 1; i <= seedCount; i++) {
        const roleArray = [
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
        // const statusArray = [
        //   "Success",
        //   "Continue",
        //   "Failed",
        //   "Accepted",
        //   "Denied",
        //   "Pending",
        // ];
        const birth = faker.date.birthdate({ min: 19, max: 65 });
        const sex = faker.person.sexType();
        const firstName = faker.person.firstName(sex);
        const lastName = faker.person.lastName();
        const fullName = `${firstName} ${lastName}`;
        const email = faker.internet.email({
          firstName: firstName,
          lastName: lastName,
          provider: "mail.mrt",
        });

        const data = {
          fullName: fullName,
          email: email,
          sex: sex,
          birthdate: birth,
          company: faker.company.name(),
          role: faker.helpers.arrayElement(roleArray),
          phoneNumber: faker.phone.number(),
          address: {
            city: faker.location.city(),
            state: faker.location.state(),
            streetAddress: faker.location.streetAddress(),
            zipCode: faker.location.zipCode(),
          },
          createdAt: faker.date.past({ years: 15 }),
        };
        await Data.create(data);
        doneCount++;
      }
      console.log({ success: true, createdCount: seedCount });
    })
    .catch((err) => console.error("Error:", err))
    .finally(() => process.exit(1));
};

getSeedCount();
