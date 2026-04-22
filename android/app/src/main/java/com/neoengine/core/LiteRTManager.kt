package com.neoengine.core

import android.content.Context
import com.google.ai.edge.litertlm.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import java.io.File

// =========================================================
// NeoEngine ToolSet – function calling untuk mengendalikan engine
// =========================================================
class NeoEngineToolSet : ToolSet {
    @Tool(description = "Add a new 3D actor to the scene")
    fun addActor(
        @ToolParam(description = "Type of actor: cube, sphere, plane, cylinder, light, camera") type: String,
        @ToolParam(description = "Name of the actor") name: String,
        @ToolParam(description = "X position") x: Float,
        @ToolParam(description = "Y position") y: Float,
        @ToolParam(description = "Z position") z: Float
    ): String {
        // TODO: Panggil native method via JNI untuk menambahkan actor
        return "Actor '$name' of type '$type' added at ($x, $y, $z)"
    }

    @Tool(description = "Generate C++ game code based on description")
    fun generateCode(
        @ToolParam(description = "Description of the gameplay feature to generate") description: String
    ): String {
        // TODO: Panggil OpenCode atau LLM untuk menghasilkan kode
        return "// Generated code for: $description\nvoid GeneratedFeature() { }"
    }

    @Tool(description = "Set transform (position, rotation, scale) of an existing actor")
    fun setTransform(
        @ToolParam(description = "Name of the actor to modify") actorName: String,
        @ToolParam(description = "X position") px: Float,
        @ToolParam(description = "Y position") py: Float,
        @ToolParam(description = "Z position") pz: Float,
        @ToolParam(description = "X rotation (degrees)") rx: Float,
        @ToolParam(description = "Y rotation (degrees)") ry: Float,
        @ToolParam(description = "Z rotation (degrees)") rz: Float,
        @ToolParam(description = "X scale") sx: Float,
        @ToolParam(description = "Y scale") sy: Float,
        @ToolParam(description = "Z scale") sz: Float
    ): String {
        return "Transform of '$actorName' updated"
    }
}

// =========================================================
// LiteRTManager – mengelola Engine dan Conversation
// =========================================================
class LiteRTManager(private val context: Context) {
    private var engine: Engine? = null
    private var conversation: Conversation? = null
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    /**
     * Inisialisasi Engine LiteRT-LM.
     * @param modelPath path ke file model .litertlm
     * @param enableTools jika true, daftarkan NeoEngineToolSet untuk function calling
     */
    suspend fun initialize(modelPath: String, enableTools: Boolean = true): Boolean = withContext(Dispatchers.IO) {
        try {
            val configBuilder = EngineConfig.Builder()
                .setModelPath(modelPath)
                .setBackend(Backend.CPU())

            val config = if (enableTools) {
                val convConfig = ConversationConfig.Builder()
                    .addToolSet(NeoEngineToolSet())
                    .build()
                configBuilder.setConversationConfig(convConfig).build()
            } else {
                configBuilder.build()
            }

            engine = Engine(config).also { it.initialize() }
            conversation = engine?.createConversation()
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    suspend fun sendMessageSync(prompt: String): String = withContext(Dispatchers.IO) {
        conversation?.sendMessage(prompt)?.text ?: ""
    }

    fun sendMessageStream(prompt: String): Flow<String> {
        return conversation?.sendMessageAsync(prompt)?.map { it.text } ?: flowOf("")
    }

    fun shutdown() {
        scope.cancel()
        conversation?.close()
        engine?.close()
        conversation = null
        engine = null
    }
}
