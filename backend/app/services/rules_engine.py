from typing import Dict, Any, Tuple

class RulesEngine:
    """
    Motor de reglas basado en Reglas.txt y el protocolo del PDF de Team Leaders.
    Evalúa automáticamente las solicitudes para sugerir clasificación, política y borrador.
    """

    @staticmethod
    def evaluate_solicitud(tipo: str, motivo: str, motivo_cat: str, tiene_evidencia: bool, coder_nombre: str, injustificados_previos: int = 0) -> Tuple[str, str, str, str]:
        """
        Retorna: (clasificacion, prioridad, politica, borrador)
        """
        nombre_pila = coder_nombre.split(" ")[0] if coder_nombre else "Coder"
        motivo_lower = (motivo or "").lower()

        # 1. Incapacidad médica
        if "incapacidad" in motivo_lower or motivo_cat == "Incapacidad medica":
            if tiene_evidencia:
                clasif = "Justificada"
                prioridad = "Baja"
                politica = "Incapacidad médica con soporte oficial de EPS es causal justificada explícita (Reglas.txt, num. 86-98)."
                borrador = f"Hola {nombre_pila}, recibimos tu incapacidad médica y queda registrada como ausencia justificada. Que te mejores pronto. Recuerda ponerte al día con el material de la sesión. — HSE Riwi"
            else:
                clasif = "Requiere evidencia"
                prioridad = "Media"
                politica = "Las incapacidades médicas deben adjuntar soporte digital de la EPS dentro de los 3 días hábiles (Reglas.txt, num. 90-91)."
                borrador = f"Hola {nombre_pila}, recibimos tu notificación de incapacidad. Por favor adjunta el soporte oficial de la EPS para formalizar la justificación dentro de los 3 días hábiles. — HSE Riwi"
            return clasif, prioridad, politica, borrador

        # 2. Cita médica o trámite oficial
        if any(w in motivo_lower for w in ["cita médica", "cita medica", "notaría", "notaria", "juzgado", "tramite", "trámite"]) or motivo_cat in ["Cita médica", "Trámite institucional"]:
            if tiene_evidencia:
                clasif = "Justificada"
                prioridad = "Baja"
                politica = "Trámite o cita con soporte verificable, causal contemplada como fuerza mayor (Reglas.txt, num. 104-107)."
                borrador = f"Hola {nombre_pila}, tu solicitud por cita/trámite con soporte adjunto queda aprobada. — HSE Riwi"
            else:
                clasif = "Requiere evidencia"
                prioridad = "Media"
                politica = "Se requiere constancia o citación oficial con fecha y hora para validar la ausencia (Reglas.txt, num. 104)."
                borrador = f"Hola {nombre_pila}, para justificar esta ausencia requerimos el comprobante o citación de la entidad. Por favor anéxalo para cerrar el caso. — HSE Riwi"
            return clasif, prioridad, politica, borrador

        # 3. Situación emocional crítica (remitir a HSE)
        if any(w in motivo_lower for w in ["ansiedad", "pánico", "emocional", "depresión", "crisis"]) or motivo_cat == "Situación emocional crítica":
            clasif = "Requiere evidencia"
            prioridad = "Alta"
            politica = "Situación emocional crítica: información sensible con remisión prioritaria y acompañamiento por HSE (PDF TL, pág. 5 y 8)."
            borrador = f"Hola {nombre_pila}, comprendemos tu situación. Desde el equipo de Habilidades Socioemocionales nos pondremos en contacto contigo para brindarte un espacio de escucha y apoyo. — HSE Riwi"
            return clasif, prioridad, politica, borrador

        # 4. Tardanzas por transporte
        if tipo == "Tardanza":
            if tiene_evidencia:
                clasif = "Justificada"
                prioridad = "Baja"
                politica = "Tardanza con reporte oficial o evidencia comprobable de inconveniente en transporte (Reglas.txt)."
                borrador = f"Hola {nombre_pila}, tu tardanza ha sido justificada con el soporte adjunto. — HSE Riwi"
            else:
                clasif = "Requiere evidencia"
                prioridad = "Media"
                politica = "Tardanzas por transporte público no cuentan como fuerza mayor salvo reporte oficial comprobable (Reglas.txt, num. 32)."
                borrador = f"Hola {nombre_pila}, gracias por avisar de tu retraso. Para registrarla como justificada requerimos un soporte del inconveniente. Quedamos atentos. — HSE Riwi"
            return clasif, prioridad, politica, borrador

        # 5. Sin evidencia o motivo genérico
        if not tiene_evidencia:
            clasif = "Injustificada"
            prioridad = "Alta" if injustificados_previos >= 2 else "Media"
            politica = f"Motivo no justificado documentalmente. Acumula {injustificados_previos} inasistencias injustificadas previas (Reglas.txt, num. 30-31)."
            borrador = f"Hola {nombre_pila}, esta ausencia queda registrada como injustificada por falta de soporte válido. Te recordamos la importancia de la puntualidad y asistencia en tu formación. — HSE Riwi"
            return clasif, prioridad, politica, borrador

        # Default
        return "Requiere evidencia", "Media", "Caso radicado en evaluación por HSE.", f"Hola {nombre_pila}, recibimos tu solicitud y se encuentra en revisión. — HSE Riwi"

    @staticmethod
    def calculate_coder_level(injustificados: int, ausencias: int, tardanzas: int) -> str:
        """
        Calcula el nivel de riesgo: 'riesgo' | 'alerta' | 'normal'
        según las reglas de riwi_hse_app.html y los umbrales de Riwi.
        """
        if injustificados >= 5 or ausencias >= 2:
            return "riesgo"
        if injustificados >= 2 or tardanzas >= 3:
            return "alerta"
        return "normal"
