import React, { useState, useEffect } from "react";
import { TextField, Box, Typography, Button } from "@mui/material";
import { ref, get, set, push, update } from "firebase/database";
import { db } from "./firebaseConfig";

const Ganancias = () => {
    const [gananciaDiaria, setGananciaDiaria] = useState("");
    const [totalGanancias, setTotalGanancias] = useState(0);
    const [mesActual, setMesActual] = useState(new Date().getMonth());
    const [fechaUltimaGanancia, setFechaUltimaGanancia] = useState(null);

    useEffect(() => {
        cargarGanancias();
    }, []);

    const cargarGanancias = async () => {
        const gananciasRef = ref(db, "ganancias/actual");
        const snapshot = await get(gananciasRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            if (data.mes !== mesActual) {
                resetearGanancias(data.total);
            } else {
                setTotalGanancias(data.total || 0);
                setFechaUltimaGanancia(data.fechaUltimaGanancia || null);
            }
        }
    };

    const agregarGanancia = async () => {
        if (!gananciaDiaria || isNaN(gananciaDiaria)) {
            alert("Ingrese una cantidad válida.");
            return;
        }

        const nuevaGanancia = totalGanancias + parseFloat(gananciaDiaria);
        setTotalGanancias(nuevaGanancia);
        setGananciaDiaria("");

        const fechaActual = new Date().toISOString(); // Obtener la fecha actual

        // Guardar la ganancia y la fecha en "ganancias/actual"
        await update(ref(db, "ganancias/actual"), {
            total: nuevaGanancia,
            mes: mesActual,
            fechaUltimaGanancia: fechaActual // Guardar la fecha de la última ganancia
        });

        setFechaUltimaGanancia(fechaActual); // Actualizar el estado con la fecha

        // También puedes agregar la fecha y la ganancia a un historial
        const historialRef = ref(db, "ganancias/historial");
        await push(historialRef, {
            mes: mesActual,
            total: parseFloat(gananciaDiaria),
            fechaGanancia: fechaActual // Guardar la fecha de la ganancia
        });
    };

    const resetearGanancias = async (totalAnterior) => {
        const historialRef = ref(db, "ganancias/historial");
        const fechaActual = new Date().toISOString(); // Obtener la fecha al reiniciar

        // Agregar el total anterior al historial
        await push(historialRef, {
            mes: mesActual,
            total: totalAnterior,
            fechaGanancia: fechaActual // Guardar la fecha de reinicio
        });

        // Reiniciar las ganancias para el mes actual
        await set(ref(db, "ganancias/actual"), { total: 0, mes: mesActual });
        setTotalGanancias(0);
        setFechaUltimaGanancia(null); // Limpiar la fecha de la última ganancia al reiniciar
    };

    // Función para obtener el nombre del mes
    const obtenerNombreMes = (mes) => {
        const nombresMeses = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        return nombresMeses[mes];
    };

    return (
        <Box sx={{ maxWidth: "100%", margin: "auto", padding: 3, backgroundColor: "#f5f5f5", borderRadius: 7, boxShadow: 2 }}>
            <Typography color="success" variant="h5" gutterBottom textAlign="center" mt={3} >
                Control de Ganancias - {obtenerNombreMes(mesActual)}
            </Typography>
            <Typography variant="h6" textAlign="center" mt={3}>
                Total de ganancias del mes: ${totalGanancias}
            </Typography>
            {fechaUltimaGanancia && (
                <Typography variant="body1" textAlign="center" mt={2}>
                    Última ganancia ingresada el: {new Date(fechaUltimaGanancia).toLocaleString()}
                </Typography>
            )}
            <Box sx={{ textAlign: "center", marginTop: 3, display:'flex', justifyContent:'center' }}>
                <TextField
                    label="Ingresar ganancia diaria"
                    value={gananciaDiaria}
                    onChange={(e) => setGananciaDiaria(e.target.value)}
                    type="number"
                    sx={{ marginRight: 2 }}
                />
                <Button variant="contained" color="secondary" onClick={agregarGanancia}>
                    Agregar Ganancia
                </Button>
            </Box>
        </Box>
    );
};

export default Ganancias;

