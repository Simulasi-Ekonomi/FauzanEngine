#pragma once
#include "Vector3.h"
#include "Quaternion.h"
#include "Matrix4.h"

struct Transform {
    Vector3 Position;
    Quaternion Rotation;
    Vector3 Scale;

    Transform() 
        : Position(0.0f, 0.0f, 0.0f)
        , Rotation(Quaternion::Identity())
        , Scale(1.0f, 1.0f, 1.0f) 
    {}

    Matrix4 ToMatrix() const {
        // Gabungan translasi, rotasi, dan skala ke Matrix4
        return Matrix4::Identity(); 
    }
};
