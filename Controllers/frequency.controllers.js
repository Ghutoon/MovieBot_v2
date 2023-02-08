const dosomething = (req, res) => {
  console.log(`params ------> ${JSON.stringify(req.query, null, 2)}`);

  switch (req.query["group_by"].toLowerCase()) {
    case "time":
      console.log("group by time");
      /*
      SELECT COUNT * FROM TABLE
        WHERE 
          date > start_of_week
            AND
          date < end_of_week
      */
      break;
    case "intents":
      console.log("group by intents");
      break;

    default:
      console.log("invalid");
      break;
  }

  /*
  req.query -> 
    detail: weekly, daily
    
    detail == week:
        starting_point: some date format like dd-mm-yyyy or the week # of the year ? 
   */

  res.send("Hello World");
};

module.exports = { dosomething };
