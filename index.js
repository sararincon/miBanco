const { Pool } = require("pg");

const config = {
  user: "sararincon",
  host: "localhost",
  database: "banco",
  password: "password",
  port: 5432,
};
const pool = new Pool(config);

const [metodo, origen, destino, monto] = process.argv.slice(2);

const transferir = async (origen, destino, monto) => {
  //Validando datos
  const montoValido = +monto;
  const origenValido = +origen;
  const destinoValido = +destino;
  console.log({ origenValido, destinoValido, montoValido });

  const transferBalanceQuery = {
    text: "INSERT INTO transferencias (descripcion, fecha, monto, cuenta_origen, cuenta_destino) VALUES ($1, $2, $3, $4, $5)",
    values: [
      "descripcion",
      2022 - 02 - 02,
      montoValido,
      origenValido,
      destinoValido,
    ],
  };
  const reduceBalanceQuery = {
    text: "UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2",
    values: [montoValido, origenValido],
  };
  const increaseBalanceQuery = {
    text: "UPDATE cuentas SET saldo = saldo + $1 WHERE id = $2",
    values: [montoValido, destinoValido],
  };
  try {
    await pool.query("BEGIN");
    await pool.query(transferBalanceQuery);
    await pool.query(reduceBalanceQuery);
    await pool.query(increaseBalanceQuery);

    console.log("Transferencia exitosa");
    pool.end();
  } catch (e) {
    await pool.query("ROLLBACK");
    console.log(e.code, e.detail);
    console.log("Transferencia fallida");
  }
};

//cuenta origen = 1
//cuenta destino = 2
//userID = 1
//UserID = 2

const getTransferencias = async (userID) => {
  try {
    const userIDValido = +userID;
    const balanceQuery = {
      text: "SELECT * FROM transferencias WHERE cuenta_origen = $1 ORDER BY fecha DESC limit 10",
      values: [userIDValido],
    };
    const { rows } = await pool.query(balanceQuery);
    console.log(rows);
    pool.end();
  } catch (e) {
    console.log(e.code, e.detail);
    console.log("Error al obtener las transferencias");
  }
};

const getBalance = async (userID) => {
  try {
    const userIDValido = +userID;
    const balanceQuery = {
      text: "SELECT saldo FROM cuentas WHERE id = $1",
      values: [userIDValido],
    };
    const { rows } = await pool.query(balanceQuery);
    console.log(rows);
    pool.end();
  } catch (e) {
    console.log(e.code, e.detail);
    console.log("Error al obtener el saldo");
  }
};

const opts = {
  transferir,
  transacciones: getTransferencias,
  balance: getBalance,
};

//node index.js transferir 1 2 100
opts[metodo](origen, destino, monto);
