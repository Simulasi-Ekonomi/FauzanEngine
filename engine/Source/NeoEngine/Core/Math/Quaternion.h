#pragma once
#include "MathUtils.h"

struct Quaternion {
    float x, y, z, w;

    Quaternion() : x(0.0f), y(0.0f), z(0.0f), w(1.0f) {}
    Quaternion(float InX, float InY, float InZ, float InW) : x(InX), y(InY), z(InZ), w(InW) {}

    static Quaternion Identity() { return Quaternion(0.0f, 0.0f, 0.0f, 1.0f); }

    // Implementasi Slerp dan perkalian akan ditambahkan saat integrasi Animasi/Physics
};
