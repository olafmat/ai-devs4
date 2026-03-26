import {
  HUB_URL,
  AIDEVS_KEY
} from "../config.js";
import { DatabaseSync } from 'node:sqlite';


let database;

export async function loadCsv(file, createSQL, insertSQL) {
    database.exec(createSQL);
    const insert = database.prepare(insertSQL);

    const response = await fetch(`${HUB_URL}/dane/s03e04_csv/${file}`, {
      method: "GET",
      headers: {
        "Content-Type": "text/csv"
      }
    });
    const text = await response.text()
    let first = true;
    for (let row of text.split('\n')) {
        if (first) {
            first = false;
            continue;
        }
        if (!row) {
            continue;
        }
        const fields = row.split(',');
        insert.run(fields[0], fields[1])
    }
}

export async function loadDatabase() {
    database = new DatabaseSync(':memory:');

    // name,code
    // Warszawa,A7K3QX
    await loadCsv(
        'cities.csv',
        `CREATE TABLE cities(
           name TEXT,
           cityCode TEXT PRIMARY KEY
         ) STRICT`,
        'INSERT INTO cities (name, cityCode) VALUES (?, ?)'
    );

    // name,code
    // Rezystor metalizowany 1 ohm 0.125 W 1%,BWST28
    await loadCsv(
        'items.csv',
        `CREATE TABLE items(
           name TEXT,
           itemCode TEXT
         ) STRICT`,
        'INSERT INTO items (name, itemCode) VALUES (?, ?)'
    );

    // itemCode,cityCode
    // 8R5ENT,Y8L2KM
    await loadCsv(
        'connections.csv',
        `CREATE TABLE connections(
           itemCode TEXT,
           cityCode TEXT
         ) STRICT`,
        'INSERT INTO connections (itemCode, cityCode) VALUES (?, ?)'
    );
}

export async function queryDatabase(sql) {
    if (!sql.toUpperCase().startsWith('SELECT')) {
        return {error: "Only SELECT queries are allowed"};
    }
    const sql2 = sql.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g,
        c => "acelnoszzACELNOSZZ".charAt("ąćęłńóśźżĄĆĘŁŃÓŚŹŻ".indexOf(c)))
    console.log(sql2);
    return await database.prepare(sql2).all();
}