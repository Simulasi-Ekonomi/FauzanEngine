package com.neoengine.core

import android.content.Context
import com.google.ai.edge.litertlm.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import java.io.File
import java.io.FileOutputStream

class LiteRTManager(private val context: Context) {
    private var engine: Engine? = null
    private var conversation: Conversation? = null
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    companion object {
        private const val HERMES_ASSET_PATH = "bin/hermes"
        private var hermesExtractedPath: String? = null

        /**
         * Extract Hermes binary from assets to internal storage.
         * Returns the executable path, or null if extraction fails.
         */
        fun extractHermes(context: Context): String? {
            if (hermesExtractedPath != null) return hermesExtractedPath

            val destFile = File(context.filesDir, "hermes")
            if (destFile.exists() && destFile.canExecute()) {
                hermesExtractedPath = destFile.absolutePath
                return hermesExtractedPath
            }

            try {
                context.assets.open(HERMES_ASSET_PATH).use { input ->
                    FileOutputStream(destFile).use { output ->
                        input.copyTo(output)
                    }
                }
                // Set executable permission (owner only for security)
                destFile.setExecutable(true, true)
                hermesExtractedPath = destFile.absolutePath
                return hermesExtractedPath
            } catch (e: Exception) {
                e.printStackTrace()
                return null
            }
        }
    }

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
