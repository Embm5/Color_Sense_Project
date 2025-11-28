/**
 * Agente Semántico Local (Cliente)
 * Responsable de:
 * - Detectar contenido visual
 * - Comunicar con el servidor semántico
 * - Aplicar transformaciones de color
 * - Mejorar accesibilidad
 */

class LocalSemanticAgent {
  constructor(serverUrl = "http://localhost:3000") {
    this.serverUrl = serverUrl;
    this.cache = new Map();
    this.currentDaltonismType = "normal";
    this.userProfile = null;
  }

  /**
   * Inicializar el agente y cargar perfil del usuario
   */
  async initialize(userId) {
    try {
      const response = await fetch(`${this.serverUrl}/api/profiles/${userId}`);
      if (response.ok) {
        this.userProfile = await response.json();
        this.currentDaltonismType = this.userProfile.daltonismType;
        console.log("✅ Agente Local: Perfil cargado", this.userProfile);
      }
    } catch (error) {
      console.warn("⚠️ Agente Local: No se pudo cargar el perfil", error);
      // Crear perfil temporal si no existe
      this.userProfile = {
        userId: userId || `user-${Date.now()}`,
        daltonismType: "normal",
        preferences: {},
      };
    }
  }

  /**
   * Adaptar contenido visual usando el servidor semántico
   */
  async adaptVisualContent(elements, daltonismType = null) {
    const type = daltonismType || this.currentDaltonismType;

    const payload = {
      userProfile: {
        userId: this.userProfile.userId,
        daltonismType: type,
        preferences: this.userProfile.preferences,
      },
      elements: elements,
      context: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      },
    };

    try {
      const response = await fetch(`${this.serverUrl}/api/adapt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      this.cache.set(`${type}-${elements.length}`, result);
      return result;
    } catch (error) {
      console.error("❌ Agente Local: Error en adaptación", error);
      // Fallback: usar transformaciones locales
      return this._localFallbackAdaptation(elements, type);
    }
  }

  /**
   * Obtener la ontología de daltonismo
   */
  async getOntology() {
    try {
      const response = await fetch(
        `${this.serverUrl}/api/adapt/ontology/daltonism`
      );
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("❌ No se pudo obtener la ontología:", error);
    }
    return null;
  }

  /**
   * Obtener transformaciones de color para un tipo de daltonismo
   */
  async getColorTransformations(daltonismType) {
    try {
      const response = await fetch(
        `${this.serverUrl}/api/adapt/color-transformations/${daltonismType}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.transformations;
      }
    } catch (error) {
      console.error("❌ No se pudieron obtener transformaciones:", error);
    }
    return {};
  }

  /**
   * Registrar feedback del usuario
   */
  async recordFeedback(
    elementId,
    elementType,
    originalColor,
    adaptedColor,
    feedback
  ) {
    try {
      await fetch(
        `${this.serverUrl}/api/profiles/${this.userProfile.userId}/adaptation-feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            elementId,
            elementType,
            originalColor,
            adaptedColor,
            userFeedback: feedback,
          }),
        }
      );
    } catch (error) {
      console.error("❌ Error registrando feedback:", error);
    }
  }

  /**
   * Embeber JSON-LD en un elemento
   */
  embedJSONLD(element, metadata) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(metadata);
    element.appendChild(script);
  }

  /**
   * Mejorar labels ARIA para accesibilidad
   */
  improveAria(element, metadata) {
    if (metadata["accessibility"]) {
      const textAlt = metadata["accessibility"]["textAlternative"];
      if (textAlt) {
        element.setAttribute("aria-label", textAlt);
        element.setAttribute("role", "img");
      }
    }
  }

  /**
   * Fallback local si el servidor no responde
   */
  _localFallbackAdaptation(elements, daltonismType) {
    const transformations = {
      protanopia: {
        "#FF0000": "#F35E62",
        "#FFA500": "#F35E62",
        "#FFFF00": "#FFFF00",
        "#00FF00": "#FFFF00",
        "#0000FF": "#0000FF",
        "#800080": "#800080",
      },
      deuteranopia: {
        "#FF0000": "#FF0000",
        "#FFA500": "#FF6600",
        "#FFFF00": "#FFAA00",
        "#00FF00": "#FFFF00",
        "#0000FF": "#0000FF",
        "#800080": "#800080",
      },
      tritanopia: {
        "#FF0000": "#E81B1B",
        "#FFA500": "#F06C6C",
        "#FFFF00": "#F7A7A7",
        "#00FF00": "#0E6B6B",
        "#0000FF": "#00CFCF",
        "#800080": "#7A4A42",
      },
    };

    const trans = transformations[daltonismType] || {};
    return {
      adaptedElements: elements.map((el) => ({
        ...el,
        adaptedColor: trans[el.originalColor] || el.originalColor,
      })),
    };
  }
}

// Exportar para uso en el navegador
window.LocalSemanticAgent = LocalSemanticAgent;
