package com.neoengine.core

import android.content.Context
import com.google.ai.edge.litertlm.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import java.io.File

class LiteRTManager(private val context: Context) {
    private var engine: Engine? = null
    private var conversation: Conversation? = null
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    suspend fun initialize(modelPath: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val config = EngineConfig(
                modelPath = modelPath,
                backend = Backend.CPU()
            )
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
