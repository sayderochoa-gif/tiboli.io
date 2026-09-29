from datetime import date, timedelta
from app.core.database import SessionLocal, Base, engine
from app.models.coder import Coder
from app.models.solicitud import Solicitud
from app.models.config_umbral import ConfigUmbral

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Umbrales
        if db.query(ConfigUmbral).count() == 0:
            umbrales = [
                ConfigUmbral(nombre="Tardanzas injustificadas", cantidad=3, ventana_dias=30, accion_sugerida="Alerta — seguimiento con coder"),
                ConfigUmbral(nombre="Ausencias sin evidencia", cantidad=2, ventana_dias=30, accion_sugerida="Riesgo de permanencia"),
                ConfigUmbral(nombre="Casos injustificados totales", cantidad=5, ventana_dias=90, accion_sugerida="Riesgo de permanencia")
            ]
            db.add_all(umbrales)
            db.commit()

        # 2. Coders
        if db.query(Coder).count() == 0:
            coders = [
                Coder(id='c1', external_id='EXT-001', nombre='Valentina Ríos', ruta='Avanzada · JS', clan='Clan Berners-Lee', jornada='Mañana', email='valentina.rios@riwi.io', acuerdo='—'),
                Coder(id='c2', external_id='EXT-002', nombre='Andrés Palacio', ruta='Básica · Python', clan='Clan Lovelace', jornada='Mañana', email='andres.palacio@riwi.io', acuerdo='—'),
                Coder(id='c3', external_id='EXT-003', nombre='Camila Zapata', ruta='Avanzada · JS', clan='Clan Berners-Lee', jornada='Tarde', email='camila.zapata@riwi.io', acuerdo='12 sep 2026'),
                Coder(id='c4', external_id='EXT-004', nombre='Juan Esteban Ortiz', ruta='Básica · Python', clan='Clan Lovelace', jornada='Tarde', email='juan.ortiz@riwi.io', acuerdo='—'),
                Coder(id='c5', external_id='EXT-005', nombre='Laura Mosquera', ruta='HSE · Socioemocional', clan='Clan Gosling', jornada='Mañana', email='laura.mosquera@riwi.io', acuerdo='—'),
                Coder(id='c6', external_id='EXT-006', nombre='Kevin Sánchez', ruta='Avanzada · JS', clan='Clan Berners-Lee', jornada='Tarde', email='kevin.sanchez@riwi.io', acuerdo='20 sep 2026'),
                Coder(id='c7', external_id='EXT-007', nombre='Daniela Arboleda', ruta='Básica · Python', clan='Clan Lovelace', jornada='Mañana', email='daniela.arboleda@riwi.io', acuerdo='—'),
            ]
            db.add_all(coders)
            db.commit()

        # 3. Casos iniciales (de riwi_hse_app.html)
        if db.query(Solicitud).count() == 0:
            today = date(2026, 9, 28)
            cases = [
                Solicitud(
                    id='C-1042', coder_id='c1', tipo='Tardanza', fecha=today,
                    motivo='Se me dañó el bus de la ruta y llegué 40 min tarde a la sesión de la mañana.',
                    evidencia=False, estado='Pendiente', clasif='Requiere evidencia', prioridad='Media',
                    politica='Tardanzas por transporte público no cuentan como fuerza mayor salvo reporte oficial de la empresa transportadora (Acuerdo de Entrenamiento, num. 4.2).',
                    borrador='Hola Valentina, gracias por avisar. Para poder marcar esta tardanza como justificada necesitamos un soporte del inconveniente de transporte (captura de la app, reporte de la empresa, etc.). Quedamos atentos a que lo envíes para cerrar el caso. — HSE Riwi'
                ),
                Solicitud(
                    id='C-1041', coder_id='c3', tipo='Ausencia', fecha=today - timedelta(days=1),
                    motivo='No pude asistir, tuve un tema personal que preferiría no detallar por correo.',
                    evidencia=False, estado='Pendiente', clasif='Injustificada', prioridad='Alta',
                    politica='Motivo no específico y sin evidencia; Camila acumula 5 casos injustificados en 90 días, supera el umbral de riesgo de permanencia (Acuerdo, num. 5.1).',
                    borrador='Hola Camila, esta ausencia queda registrada como injustificada por falta de motivo y evidencia verificable. Además, con este caso superas el número de incidencias injustificadas contempladas en el Acuerdo de Entrenamiento. Vamos a agendar una conversación contigo para revisar tu situación. — HSE Riwi'
                ),
                Solicitud(
                    id='C-1040', coder_id='c6', tipo='Ausencia', fecha=today - timedelta(days=2),
                    motivo='Incapacidad médica por gripe, adjunto soporte de la EPS.',
                    evidencia=True, estado='Pendiente', clasif='Justificada', prioridad='Baja',
                    politica='Incapacidad médica con soporte de EPS es causal justificada explícita (Acuerdo, num. 3.1).',
                    borrador='Hola Kevin, recibimos tu incapacidad médica y queda registrada como ausencia justificada. Que te mejores pronto. Recuerda ponerte al día con el material de la sesión. — HSE Riwi'
                ),
                Solicitud(
                    id='C-1039', coder_id='c5', tipo='Permiso', fecha=today - timedelta(days=3),
                    motivo='Solicito permiso para cita médica programada el jueves en la mañana.',
                    evidencia=True, estado='Aprobado', clasif='Justificada', prioridad='Baja',
                    politica='Permiso solicitado con anticipación y soporte de cita médica (Acuerdo, num. 3.2).',
                    borrador='Hola Laura, tu permiso para la cita médica del jueves queda aprobado. Gracias por avisar con anticipación. — HSE Riwi'
                ),
                Solicitud(
                    id='C-1038', coder_id='c2', tipo='Ausencia', fecha=today - timedelta(days=4),
                    motivo='Cita en notaría para trámite familiar urgente, adjunto la cita.',
                    evidencia=True, estado='Aprobado', clasif='Justificada', prioridad='Baja',
                    politica='Trámite legal con soporte verificable, causal contemplada como caso de fuerza mayor (Acuerdo, num. 3.3).',
                    borrador='Hola Andrés, tu ausencia por el trámite en notaría queda aprobada. Gracias por adjuntar el soporte. — HSE Riwi'
                ),
                Solicitud(
                    id='C-1037', coder_id='c6', tipo='Tardanza', fecha=today - timedelta(days=5),
                    motivo='Se me pegaron las cobijas, disculpen.',
                    evidencia=False, estado='Rechazado', clasif='Injustificada', prioridad='Alta',
                    politica='Motivo no contemplado como causal justificable (Acuerdo, num. 4.1). Kevin acumula 6 casos injustificados.',
                    borrador='Hola Kevin, esta tardanza queda registrada como injustificada. Ya es la sexta incidencia injustificada tuya en el periodo — vamos a citarte con HSE para conversar sobre tu continuidad en el programa. — HSE Riwi'
                ),
                Solicitud(
                    id='C-1036', coder_id='c7', tipo='Permiso', fecha=today - timedelta(days=6),
                    motivo='Permiso para asistir a grado de mi hermana.',
                    evidencia=False, estado='Aprobado', clasif='Justificada', prioridad='Baja',
                    politica='Evento familiar excepcional, aprobado con criterio de HSE aunque no requiere evidencia obligatoria (Acuerdo, num. 3.4).',
                    borrador='Hola Daniela, tu permiso queda aprobado, felicitaciones a tu hermana. — HSE Riwi'
                ),
                Solicitud(
                    id='C-1035', coder_id='c1', tipo='Ausencia', fecha=today - timedelta(days=9),
                    motivo='No me sentía bien, no fui al médico.',
                    evidencia=False, estado='Rechazado', clasif='Injustificada', prioridad='Media',
                    politica='Sin evidencia médica ni soporte, no cumple causal justificable (Acuerdo, num. 3.1).',
                    borrador='Hola Valentina, esta ausencia queda como injustificada por falta de soporte médico. Para futuros casos similares, te pedimos anexar una constancia. — HSE Riwi'
                )
            ]
            db.add_all(cases)
            db.commit()

        print("[OK] Base de datos inicializada y sembrada con datos de prueba.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
