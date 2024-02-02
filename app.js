const fs = require("fs");
// Name,Ticker,"Sub_Sector","Market_Cap","Close_Price","PE_Ratio","Recommendations","Overbought_100","change_6m","EverythingAllAtOnce"

let result = [];
try {
  let data = fs.readFileSync("./All_02_02_2024.csv", "utf8");
  data = data.replaceAll('"', "");
  const lines = data.split("\n");
  const header = lines[0].split(",");
  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentLine = lines[i].split(",");
    for (let j = 0; j < header.length; j++) {
      obj[header[j]] = !!parseFloat(currentLine[j])
        ? parseFloat(currentLine[j])
        : currentLine[j];
    }
    result.push(obj);
  }
} catch (err) {
  console.error(err);
}

result = result
  .filter(
    (r) =>
      typeof r["Close_Price"] === "number" &&
      typeof r["Market_Cap"] === "number" &&
      typeof r["EverythingAllAtOnce"] === "number" &&
      typeof r["Overbought_100"] === "number",
  )
  .map((r) => ({
    Name: r["Name"],
    Sub_Sector: r["Sub_Sector"],
    Close_Price: r["Close_Price"],
    Market_Cap: r["Market_Cap"],
    Score: r["EverythingAllAtOnce"],
    OverBought: 100 - r["Overbought_100"],
    Change_6m: r["change_6m"],
    OneYearReturn: r["1Y Return"],
    FiveYearCagr: r["5Y CAGR"],
  }));

let sumClosePrice = 0;
let sumMarketCap = 0;
let sumScore = 0;
let sumOverBought = 0;

for (let i = 0; i < result.length; i++) {
  sumClosePrice += result[i]["Close_Price"];
  sumMarketCap += result[i]["Market_Cap"];
  sumScore += result[i]["Score"];
  sumOverBought += result[i]["OverBought"];
}

console.log({
  close: sumClosePrice / result.length,
  mktCap: sumMarketCap / result.length,
  score: sumScore / result.length,
  overBought: sumOverBought / result.length,
  len: result.length,
});
