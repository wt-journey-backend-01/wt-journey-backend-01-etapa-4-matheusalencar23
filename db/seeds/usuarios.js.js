/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("table_name").del();
  await knex("table_name").insert([
    { nome: "João Pedro", email: "joaopedro@gmail.com", senha: "123456" },
    { nome: "Ana Maria", email: "anamaria@gmail.com", senha: "654321" },
  ]);
};
