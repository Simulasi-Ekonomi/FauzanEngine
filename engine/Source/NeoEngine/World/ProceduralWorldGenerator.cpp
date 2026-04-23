#include "ProceduralWorldGenerator.h"
#include <cmath>
#include <algorithm>
#include <random>
#include <FastNoiseLite.h>
#include <cereal/archives/binary.hpp>
#include <cereal/types/vector.hpp>
#include <cereal/types/string.hpp>
#include <fstream>

namespace NeoEngine {

ProceduralWorldGenerator::ProceduralWorldGenerator(const WorldConfig& cfg)
    : m_Config(cfg), m_RNG(cfg.seed)
{
    InitNoise();
    DefineBiomes();
}

ProceduralWorldGenerator::~ProceduralWorldGenerator() = default;

void ProceduralWorldGenerator::InitNoise() {
    m_HeightNoise.SetSeed(m_Config.seed);
    m_HeightNoise.SetFrequency(0.002f);
    m_HeightNoise.SetFractalType(FastNoiseLite::FractalType_FBm);
    m_HeightNoise.SetFractalOctaves(5);
    m_HeightNoise.SetFractalLacunarity(2.0f);
    m_HeightNoise.SetFractalGain(0.5f);

    m_MoistureNoise.SetSeed(m_Config.seed + 1000);
    m_MoistureNoise.SetFrequency(0.0015f);
    m_MoistureNoise.SetFractalType(FastNoiseLite::FractalType_FBm);
    m_MoistureNoise.SetFractalOctaves(3);

    m_TemperatureNoise.SetSeed(m_Config.seed + 2000);
    m_TemperatureNoise.SetFrequency(0.001f);
    m_TemperatureNoise.SetFractalOctaves(2);

    m_RiverNoise.SetSeed(m_Config.seed + 3000);
    m_RiverNoise.SetFrequency(0.003f);
}

void ProceduralWorldGenerator::DefineBiomes() {
    m_Biomes = {
        {"ocean",      -1.0f, -0.05f, 0.0f, 1.0f, 0.0f, {}},
        {"beach",      -0.05f, 0.05f, 0.0f, 1.0f, 0.2f, {"palm"}},
        {"plains",      0.05f, 0.3f,  0.0f, 0.6f, 1.0f, {"oak", "birch"}},
        {"forest",      0.1f,  0.5f,  0.4f, 0.9f, 2.5f, {"oak", "pine", "birch"}},
        {"taiga",       0.2f,  0.6f,  0.0f, 0.3f, 2.0f, {"pine", "spruce"}},
        {"mountain",    0.4f,  1.0f,  0.0f, 1.0f, 0.5f, {"pine"}},
        {"desert",      0.1f,  0.4f,  0.0f, 0.2f, 0.1f, {"cactus"}},
        {"snow",        0.3f,  1.0f,  0.0f, 0.3f, 0.1f, {"snow_pine"}}
    };
}

float ProceduralWorldGenerator::GetHeight(float x, float z) {
    float h = m_HeightNoise.GetNoise(x, z);
    float ridge = std::abs(m_RiverNoise.GetNoise(x * 0.5f, z * 0.5f));
    h = h * 0.7f + ridge * 0.3f;
    return (h + 1.0f) * 0.5f * m_Config.heightScale;
}

float ProceduralWorldGenerator::GetMoisture(float x, float z) {
    return (m_MoistureNoise.GetNoise(x, z) + 1.0f) * 0.5f;
}

float ProceduralWorldGenerator::GetTemperature(float x, float z) {
    return (m_TemperatureNoise.GetNoise(x, z) + 1.0f) * 0.5f;
}

bool ProceduralWorldGenerator::IsRiver(float x, float z) {
    float r = m_RiverNoise.GetNoise(x, z);
    return std::abs(r) < 0.02f && GetHeight(x, z) > m_Config.heightScale * 0.1f;
}

Biome ProceduralWorldGenerator::GetBiomeAt(float worldX, float worldZ) {
    float h = GetHeight(worldX, worldZ) / m_Config.heightScale;
    float m = GetMoisture(worldX, worldZ);
    for (const auto& b : m_Biomes) {
        if (h >= b.minHeight && h < b.maxHeight &&
            m >= b.minMoisture && m < b.maxMoisture) {
            return b;
        }
    }
    return m_Biomes[2]; // default plains
}

WorldChunk ProceduralWorldGenerator::GenerateChunk(int cx, int cz) {
    WorldChunk chunk{cx, cz};
    float startX = cx * m_Config.chunkSizeM;
    float startZ = cz * m_Config.chunkSizeM;
    int res = 64;
    float step = m_Config.chunkSizeM / res;

    // Heightmap
    for (int i = 0; i < res; ++i) {
        for (int j = 0; j < res; ++j) {
            float wx = startX + i * step;
            float wz = startZ + j * step;
            chunk.terrainHeight[i][j] = GetHeight(wx, wz);
        }
    }

    chunk.biome = GetBiomeAt(startX + m_Config.chunkSizeM/2, startZ + m_Config.chunkSizeM/2);

    // Place objects
    std::uniform_real_distribution<float> dist(0,1);
    for (int i = 0; i < res; i+=2) {
        for (int j = 0; j < res; j+=2) {
            float wx = startX + i * step;
            float wz = startZ + j * step;
            float h = chunk.terrainHeight[i][j];
            if (IsRiver(wx, wz)) continue;
            float r = dist(m_RNG);
            if (r < m_Config.treeDensity * chunk.biome.treeDensityMod) {
                PlacedObject obj;
                obj.type = chunk.biome.treeTypes.empty() ? "oak" : 
                           chunk.biome.treeTypes[rand() % chunk.biome.treeTypes.size()];
                obj.position = {wx, h, wz};
                obj.scale = {1.0f + dist(m_RNG)*0.5f, 1.0f + dist(m_RNG)*0.8f, 1.0f + dist(m_RNG)*0.5f};
                obj.rotation = {0, dist(m_RNG)*360.0f, 0};
                chunk.objects.push_back(obj);
            } else if (r < m_Config.rockDensity + m_Config.treeDensity) {
                PlacedObject obj{"rock", {wx, h, wz}, {0, dist(m_RNG)*360,0}, {0.5f+dist(m_RNG),0.3f,0.5f+dist(m_RNG)}};
                chunk.objects.push_back(obj);
            }
        }
    }
    chunk.generated = true;
    return chunk;
}

void ProceduralWorldGenerator::PrecomputeWorld() {
    float half = m_Config.worldSizeKm * 500.0f;
    int steps = static_cast<int>(m_Config.worldSizeKm * 1000.0f / BIOME_GRID_SIZE);
    for (int x = -steps/2; x < steps/2; ++x) {
        for (int z = -steps/2; z < steps/2; ++z) {
            float wx = x * BIOME_GRID_SIZE;
            float wz = z * BIOME_GRID_SIZE;
            m_BiomeMap[Hash(x, z)] = GetBiomeAt(wx, wz);
            m_RiverMap[Hash(x, z)] = IsRiver(wx, wz) ? 1.0f : 0.0f;
        }
    }
}

uint64_t ProceduralWorldGenerator::Hash(int x, int z) const {
    return (static_cast<uint64_t>(x) << 32) | static_cast<uint32_t>(z);
}

void ProceduralWorldGenerator::SaveToFile(const std::string& path) {
    std::ofstream ofs(path, std::ios::binary);
    cereal::BinaryOutputArchive archive(ofs);
    // Serialize necessary data
}

void ProceduralWorldGenerator::LoadFromFile(const std::string& path) {
    std::ifstream ifs(path, std::ios::binary);
    cereal::BinaryInputArchive archive(ifs);
    // Deserialize
}

} // namespace NeoEngine
