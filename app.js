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
  .map((r) => ({
    Name: r["Name"],
    Sub_Sector: r["Sub-Sector"],
    Market_Cap: r["Market Cap"],
    Close_Price: r["Close Price"],
    // Score: r["EverythingAllAtOnce"],
    // OverBought: 100 - r["Overbought_100"],
    // Change_6m: r["change_6m"],
    OneYearReturn: r["1Y Return"],
    FiveYearCagr: r["5Y CAGR"],
  }))
  .filter(
    (r) =>
      typeof r.Market_Cap === "number" &&
      typeof r.Close_Price === "number" &&
      // typeof r["EverythingAllAtOnce"] === "number" &&
      // typeof r["Overbought_100"] === "number" &&
      typeof r.OneYearReturn === "number" &&
      typeof r.FiveYearCagr === "number" &&
      r.Sub_Sector !== undefined,
  );

console.log({ result });
console.log({ result: result.length });

const sectorGrouped = result.reduce((acc, curr) => {
  if (!acc[curr.Sub_Sector]) {
    acc[curr.Sub_Sector] = {
      count: 0,
      marketCap: 0,
      sumOneYearReturn: 0,
      sumFiveYearCagr: 0,
    };
  }
  acc[curr.Sub_Sector].count++;
  acc[curr.Sub_Sector].marketCap += curr.Market_Cap;
  acc[curr.Sub_Sector].sumOneYearReturn += curr.OneYearReturn;
  acc[curr.Sub_Sector].sumFiveYearCagr += curr.FiveYearCagr;
  return acc;
}, {});

const sectoredGroupArray = Object.keys(sectorGrouped)
  .map((key) => ({
    Sub_Sector: key,
    count: sectorGrouped[key].count,
    avgMarketCap: sectorGrouped[key].marketCap / sectorGrouped[key].count,
    // avgScore: sectorGrouped[key].sumScore / sectorGrouped[key].count,
    avgOneYearReturn:
      sectorGrouped[key].sumOneYearReturn / sectorGrouped[key].count,
    avgFiveYearCagr:
      sectorGrouped[key].sumFiveYearCagr / sectorGrouped[key].count,
  }))
  .sort((a, b) => b.avgOneYearReturn - a.avgOneYearReturn);

sectoredGroupArray.map((s) => {
  console.log(
    s.Sub_Sector,
    s.avgMarketCap,
    s.count,
    s.avgOneYearReturn,
    s.avgFiveYearCagr,
  );
});

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

// console.log({
//   close: sumClosePrice / result.length,
//   mktCap: sumMarketCap / result.length,
//   score: sumScore / result.length,
//   overBought: sumOverBought / result.length,
//   len: result.length,
// });
