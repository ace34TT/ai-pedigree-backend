import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { text_model } from "./configs/gemini.config";
import { deleteFile, extractTextFromPdf } from "./helpers/file.helpers";
import upload from "./middlewares/multer.middlewares";

const tmpDirectory = path.resolve(__dirname, "tmp/");
const app = express();
app.use(
  cors({
    origin: true,
  })
);
app.use(bodyParser.json());

app.get("/", async (req: Request, res: Response) => {
  return res.status(200).send("Hello world");
});
app.post(
  "/api/json-tree",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      let text;
      if (req.file) {
        console.log("generated from pdf");
        text = await extractTextFromPdf(req.file.filename);
      } else {
        text = req.body.data;
      }
      console.log(text);
      const result = await text_model.generateContent(
        `${text} can you convert it into single json tree as this example , use exactly these attributes , children , name ,attribute ? do not say anything else just give the raw json
              {
                "children": [
                  {
                    "name": "AU 18 TOPF 814",
                    "attributes": {
                      "description": "Sent to Flying Aces One Loft. She was always on the drop during training. She injured her wings right before the activation race. I activated her anyways. She slowly came back from behind to get 2nd = 1st 350 miles. Money Winner. She also bred 1st Ace Pigeon, 1st Champion bird.",
                      "name":"Nou Chong Yang"
                      "children": [
                        {
                          "name": "AU 16 TOPF 13",
                          "attributes": {
                            "description": "Proven Racer and Breeder.\nFlew every week and won diploma every race. 1st place 400 miles Topeka. 1st place 300 miles. 1st Yearling Hall of Fame MN. 3rd Yearling Hall of Fame USA. 1st Champion bird short distance. 1st Champion bird overall. 2nd Middle Distance Ace pigeon. 4th AU Digest Overall Ace 501-1000birds. \"Fast Freddy\" is sire to e 1st 2nd place Flying Aces One loft 350 miles and gsire to 1st Ace Pigeon 2019."
                            "name": "FAST FREDDY"
                          }
                        }
                        ....
                      ]
                    }
                  }
                ]
        }`
      );
      if (req.file) deleteFile(req.file?.filename);
      return res
        .status(200)
        .json(
          JSON.parse(
            result.response.text().replace(/`/g, "").replace(/json/g, "")
          )
        );
    } catch (error) {
      console.trace(error);
      return res.status(500).send("error while processing file");
    }
  }
);
export { app };
