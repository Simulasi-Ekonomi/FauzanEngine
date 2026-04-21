cmake_minimum_required(VERSION 3.22.1)
project(NeoEngineAndroid LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Path relatif dari JNI ke engine source (dalam repo yang sama)
set(NEO_ENGINE_ROOT "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../engine/Source/NeoEngine")

message(STATUS "Engine root: ${NEO_ENGINE_ROOT}")

file(GLOB_RECURSE NEO_CORE_SRC
    "${NEO_ENGINE_ROOT}/Core/*.cpp"
    "${NEO_ENGINE_ROOT}/ECS/*.cpp"
    "${NEO_ENGINE_ROOT}/Platform/Android/*.cpp"
    "${NEO_ENGINE_ROOT}/Platform/Common/*.cpp"
    "${NEO_ENGINE_ROOT}/Rendering/RHI/*.cpp"
    "${NEO_ENGINE_ROOT}/Rendering/Renderer/*.cpp"
    "${NEO_ENGINE_ROOT}/World/*.cpp"
    "${NEO_ENGINE_ROOT}/Editor/*.cpp"
    "${NEO_ENGINE_ROOT}/Memory/*.cpp"
    "${NEO_ENGINE_ROOT}/Actor*.cpp"
    "${NEO_ENGINE_ROOT}/ECSManager.cpp"
    "${NEO_ENGINE_ROOT}/GameInstanceCore.cpp"
    "${NEO_ENGINE_ROOT}/GameModeCore.cpp"
    "${NEO_ENGINE_ROOT}/GameStateCore.cpp"
)

file(GLOB JNI_BRIDGE_SRC "${CMAKE_CURRENT_SOURCE_DIR}/*.cpp")

add_library(neo_core SHARED
    ${NEO_CORE_SRC}
    ${JNI_BRIDGE_SRC}
)

target_include_directories(neo_core PUBLIC
    ${NEO_ENGINE_ROOT}
    ${NEO_ENGINE_ROOT}/Core
    ${NEO_ENGINE_ROOT}/Core/Math
    ${NEO_ENGINE_ROOT}/Core/Memory
    ${NEO_ENGINE_ROOT}/Core/Debug
    ${NEO_ENGINE_ROOT}/Core/Object
    ${NEO_ENGINE_ROOT}/ECS
    ${NEO_ENGINE_ROOT}/Platform
    ${NEO_ENGINE_ROOT}/Platform/Android
    ${NEO_ENGINE_ROOT}/Platform/Common
    ${NEO_ENGINE_ROOT}/Rendering
    ${NEO_ENGINE_ROOT}/Rendering/RHI
    ${NEO_ENGINE_ROOT}/Rendering/Renderer
    ${NEO_ENGINE_ROOT}/World
    ${NEO_ENGINE_ROOT}/Editor
    ${NEO_ENGINE_ROOT}/Memory
)

find_library(log-lib log)
find_library(android-lib android)

target_link_libraries(neo_core
    ${log-lib}
    ${android-lib}
)

target_compile_definitions(neo_core PRIVATE
    ANDROID
    NEO_PLATFORM_ANDROID=1
    __ARM_NEON=1
)

find_library(vulkan-lib vulkan)
if(vulkan-lib)
    target_link_libraries(neo_core ${vulkan-lib})
    target_compile_definitions(neo_core PRIVATE NEO_VULKAN_ENABLED=1)
endif()

message(STATUS "NeoEngine Android build configured for ${ANDROID_ABI}")
