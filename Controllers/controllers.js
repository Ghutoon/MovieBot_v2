const axios = require("axios");
const nlp_model = require("../retain_model");
const { logger } = require("../logger");
const WhatsappUtils = new (require("../WhatsappUtils").WhatsappUtils)();
const IMDB = new (require("../IMDB").IMDB)();

require("dotenv").config();

const PORT = 9999;
const model = new nlp_model.natural_language_processing_model();
model.load_model();

const ping = (req, res) => {
  res.send("Hello World");
};

//This function verifies the token sent by whatsapp to configure webhook with the server. //

const verify_token = (req, res) => {
  if (req.query["hub.verify_token"] == process.env.SECRET) {
    logger.debug("Token Verified");
    res.send(req.query["hub.challenge"]);
  } else res.sendStatus(403);
};

const fetch_info_and_post_to_whatsapp = async (req, res) => {
  console.log(req.body);
  const num_msg_tuple = WhatsappUtils.extract_number_and_message(req.body);

  if (num_msg_tuple == null) {
    console.log("message or phone number were broken");
    logger.error("Broken phone number or link");
    // res.sendStatus(200);
    return;
  }
  let num = num_msg_tuple.num;
  let msg = num_msg_tuple.msg;
  logger.debug(`Extracted message : ${msg} `);
  logger.debug(`Destination Phone number : ${num}`);
  let movie_info = null;
  let message_body = null;

  let EntityIntent_tuple = null;

  try {
    EntityIntent_tuple = await model.extract_characteristics(msg);

    console.log(EntityIntent_tuple.entities);
    console.log(EntityIntent_tuple.intents);

    logger.debug(`Entitites extraced : \n ${EntityIntent_tuple.entities}`);
    logger.debug(
      `Intent extraced : ${EntityIntent_tuple.intents} with probability: ${EntityIntent_tuple.score}`
    );
  } catch (err) {
    console.error(`entity and intent extraction failed: ${err.message}`);
  }

  if (EntityIntent_tuple != null) {
    try {
      ({ movie_info, message_body } = await IMDB.get_movie_query_from_intents(
        EntityIntent_tuple
      ));
    } catch (err) {
      console.error(
        `could not fetch movie information or response message: ${err.message}`
      );
    }
  }

  if (message_body == null) message_body = "oh no, something went wrong";

  const payload = WhatsappUtils.generate_payload(num, message_body);

  axios(payload)
    .then((response) => {
      logger.debug("Message sent successfully");
      console.log("Message sent successfully");
    })
    .catch((err) => {
      logger.error("Something went wrong while sending the message");
      console.log("Something went wrong while sending the message");
    });

  console.log(`===========BODY===========\n${message_body}`);

  res.sendStatus(200);
};

module.exports = {
  ping,
  verify_token,
  fetch_info_and_post_to_whatsapp,
};