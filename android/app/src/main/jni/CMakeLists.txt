# =========================================================
# NeoEngine Android JNI - CMakeLists.txt
# Builds neo_core as shared library for ARM64-v8a
# =========================================================

cmake_minimum_required(VERSION 3.22.1)
project(NeoEngineAndroid LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Engine source root
set(NEO_ENGINE_ROOT "${CMAKE_CURRENT_SOURCE_DIR}/../../../../engine/Source/NeoEngine")

file(GLOB_RECURSE NEO_CORE_SRC
    "${NEO_ENGINE_ROOT}/*.cpp"
    "${NEO_ENGINE_ROOT}/Core/*.cpp"
    "${NEO_ENGINE_ROOT}/Core/Memory/*.cpp"
    "${NEO_ENGINE_ROOT}/Core/Debug/*.cpp"
    "${NEO_ENGINE_ROOT}/Core/Log/*.cpp"
    "${NEO_ENGINE_ROOT}/Core/Math/*.cpp"
    "${NEO_ENGINE_ROOT}/Core/Object/*.cpp"
    "${NEO_ENGINE_ROOT}/ECS/*.cpp"
    "${NEO_ENGINE_ROOT}/Platform/Android/*.cpp"
    "${NEO_ENGINE_ROOT}/Platform/Common/*.cpp"
    "${NEO_ENGINE_ROOT}/Rendering/*.cpp"
    "${NEO_ENGINE_ROOT}/Rendering/RHI/*.cpp"
    "${NEO_ENGINE_ROOT}/Rendering/RHI/Vulkan/*.cpp"
    "${NEO_ENGINE_ROOT}/Rendering/Renderer/*.cpp"
    "${NEO_ENGINE_ROOT}/Rendering/Shader/*.cpp"
    "${NEO_ENGINE_ROOT}/World/*.cpp"
    "${NEO_ENGINE_ROOT}/Editor/*.cpp"
    "${NEO_ENGINE_ROOT}/Memory/*.cpp"
    "${NEO_ENGINE_ROOT}/Actor/*.cpp"
    "${NEO_ENGINE_ROOT}/Asset/*.cpp"
    "${NEO_ENGINE_ROOT}/Component/*.cpp"
    "${NEO_ENGINE_ROOT}/Cooker/*.cpp"
    "${NEO_ENGINE_ROOT}/Gizmo/*.cpp"
    "${NEO_ENGINE_ROOT}/Importer/*.cpp"
    "${NEO_ENGINE_ROOT}/Level/*.cpp"
    "${NEO_ENGINE_ROOT}/Materials/*.cpp"
    "${NEO_ENGINE_ROOT}/Object/*.cpp"
    "${NEO_ENGINE_ROOT}/RHI/*.cpp"
    "${NEO_ENGINE_ROOT}/Reflection/*.cpp"
    "${NEO_ENGINE_ROOT}/Serializer/*.cpp"
    "${NEO_ENGINE_ROOT}/Threading/*.cpp"
    "${NEO_ENGINE_ROOT}/Viewport/*.cpp"
    "${NEO_ENGINE_ROOT}/Autonomous/*.cpp"
)

# JNI Bridge sources
file(GLOB JNI_BRIDGE_SRC
    "${CMAKE_CURRENT_SOURCE_DIR}/*.cpp"
)

add_library(neo_core SHARED
    ${NEO_CORE_SRC}
    ${JNI_BRIDGE_SRC}
)

target_include_directories(neo_core PUBLIC
    ${NEO_ENGINE_ROOT}
    ${NEO_ENGINE_ROOT}/Core
    ${NEO_ENGINE_ROOT}/Core/Memory
    ${NEO_ENGINE_ROOT}/Core/Debug
    ${NEO_ENGINE_ROOT}/Core/Log
    ${NEO_ENGINE_ROOT}/Core/Math
    ${NEO_ENGINE_ROOT}/Core/Object
    ${NEO_ENGINE_ROOT}/ECS
    ${NEO_ENGINE_ROOT}/Platform
    ${NEO_ENGINE_ROOT}/Platform/Common
    ${NEO_ENGINE_ROOT}/Platform/Android
    ${NEO_ENGINE_ROOT}/Rendering
    ${NEO_ENGINE_ROOT}/Rendering/RHI
    ${NEO_ENGINE_ROOT}/Rendering/RHI/Vulkan
    ${NEO_ENGINE_ROOT}/Rendering/Renderer
    ${NEO_ENGINE_ROOT}/Rendering/Shader
    ${NEO_ENGINE_ROOT}/World
    ${NEO_ENGINE_ROOT}/Editor
    ${NEO_ENGINE_ROOT}/Memory
    ${NEO_ENGINE_ROOT}/Actor
    ${NEO_ENGINE_ROOT}/Asset
    ${NEO_ENGINE_ROOT}/Component
    ${NEO_ENGINE_ROOT}/Cooker
    ${NEO_ENGINE_ROOT}/Gizmo
    ${NEO_ENGINE_ROOT}/Importer
    ${NEO_ENGINE_ROOT}/Level
    ${NEO_ENGINE_ROOT}/Materials
    ${NEO_ENGINE_ROOT}/Object
    ${NEO_ENGINE_ROOT}/RHI
    ${NEO_ENGINE_ROOT}/Reflection
    ${NEO_ENGINE_ROOT}/Serializer
    ${NEO_ENGINE_ROOT}/Threading
    ${NEO_ENGINE_ROOT}/Viewport
    ${NEO_ENGINE_ROOT}/Autonomous
)

# Android NDK libraries
find_library(log-lib log)
find_library(android-lib android)

target_link_libraries(neo_core
    ${log-lib}
    ${android-lib}
    android
    log
)

target_compile_definitions(neo_core PRIVATE
    ANDROID
    NEO_PLATFORM_ANDROID=1
    NEO_ARM64=1
    __ARM_NEON=1
)

# Vulkan (optional on Android)
find_library(vulkan-lib vulkan)
if(vulkan-lib)
    target_link_libraries(neo_core ${vulkan-lib})
    target_compile_definitions(neo_core PRIVATE NEO_VULKAN_ENABLED=1)
    message(STATUS "Vulkan found on Android - RHI enabled")
endif()

set_target_properties(neo_core PROPERTIES
    OUTPUT_NAME "neo_core"
    LIBRARY_OUTPUT_DIRECTORY "${CMAKE_LIBRARY_OUTPUT_DIRECTORY}/${ANDROID_ABI}"
)

message(STATUS "NeoEngine Android NDK build configured for ${ANDROID_ABI}")
message(STATUS "C++ Standard: ${CMAKE_CXX_STANDARD}")
