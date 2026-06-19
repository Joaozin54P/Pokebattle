import axios from "axios";
import { Pokemon } from "../@type/pokemon";

const API_URL = axios.create({
  baseURL: "https://pokeapi.co/api/v2",
  timeout: 5000,
});

function sortearIdsAleatorios(quantidade: number) {
  const ids = Array.from({ length: 151 }, (_, index) => index + 1);

  return ids
    .sort(() => Math.random() - 0.5)
    .slice(0, quantidade);
}

export const getPokemon = async (limit = 15): Promise<Pokemon[]> => {
  try {
    const idsAleatorios = sortearIdsAleatorios(limit);

    const pokemonDetails = await Promise.all(
      idsAleatorios.map(async (id) => {
        const response = await API_URL.get(`/pokemon/${id}`);
        const details = response.data;

        return {
          index: details.id.toString().padStart(3, "0"),
          nome: details.name,
          imagem: details.sprites.front_default,
          tipos: details.types.map(
            (typeInfo: { type: { name: string } }) => typeInfo.type.name
          ),
          poderes: details.stats.map(
            (statInfo: { stat: { name: string }; base_stat: number }) => ({
              nome: statInfo.stat.name,
              forca: statInfo.base_stat,
            })
          ),
        };
      })
    );

    return pokemonDetails;
  } catch (error) {
    console.error("Erro ao buscar os pokémons:", error);
    return [];
  }
};