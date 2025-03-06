import React, { useState, useEffect } from "react";
import { TextField, Box, Typography, Button } from "@mui/material";
import { ref, get, push } from "firebase/database";
import { db } from "./firebaseConfig";

const Ganancias = () => {
    const [gananciaDiaria, setGananciaDiaria] = useState("");
    const [totalGanancias, setTotalGanancias] = useState(0);
    const [totalGananciasPrevias, setTotalGananciasPrevias] = useState(0);
    const [gananciasPorDia, setGananciasPorDia] = useState([]);
    const [diasTrabajados, setDiasTrabajados] = useState(0);
    const [diasTrabajadosPrevios, setDiasTrabajadosPrevios] = useState(0);
    const [mesActual, setMesActual] = useState(new Date().getMonth());

    useEffect(() => {
        cargarGanancias();
    }, []);

    const cargarGanancias = async () => {
        const gananciasRef = ref(db, "ganancias/historial");
        const snapshot = await get(gananciasRef);
        if (snapshot.exists()) {
            const data = snapshot.val();

            const mesFiltrado = Object.values(data).filter(
                (g) => new Date(g.fechaGanancia).getMonth() === mesActual
            );
            const mesAnterior = Object.values(data).filter(
                (g) => new Date(g.fechaGanancia).getMonth() === (mesActual - 1)
            );

            setGananciasPorDia(mesFiltrado);
            setTotalGanancias(mesFiltrado.reduce((sum, g) => sum + g.total, 0));
            setTotalGananciasPrevias(mesAnterior.reduce((sum, g) => sum + g.total, 0));

            setDiasTrabajados(new Set(mesFiltrado.map(g => new Date(g.fechaGanancia).toLocaleDateString())).size);
            setDiasTrabajadosPrevios(new Set(mesAnterior.map(g => new Date(g.fechaGanancia).toLocaleDateString())).size);
        }
    };

    const agregarGanancia = async () => {
        if (!gananciaDiaria || isNaN(gananciaDiaria)) {
            alert("Ingrese una cantidad válida.");
            return;
        }

        const nuevaGanancia = parseFloat(gananciaDiaria);
        setGananciaDiaria("");
        const fechaActual = new Date().toISOString();

        await push(ref(db, "ganancias/historial"), {
            mes: mesActual,
            total: nuevaGanancia,
            fechaGanancia: fechaActual
        });

        cargarGanancias();
    };

    const obtenerNombreMes = (mes) => {
        const nombresMeses = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        return nombresMeses[mes] || "Desconocido";
    };

    return (
        <Box sx={{ maxWidth: "100%", margin: "auto", padding: 3, backgroundColor: "#fffde2", borderRadius: 7, boxShadow: 2 }}>
            <Typography color="success" variant="h5" gutterBottom textAlign="center" mt={3}>
                Control de Ganancias <Typography color="lightgreen" fontSize='2rem'>{obtenerNombreMes(mesActual)}</Typography>
            </Typography>
            <Typography variant="h6" textAlign="center" mt={3}>
                Total de ganancias de {obtenerNombreMes(mesActual)}:<Typography fontWeight='bold' fontSize='4rem' color="orange">${totalGanancias}</Typography>
            </Typography>
            <Typography variant="h6" textAlign="center" mt={2}>
                Días trabajados: <Typography fontWeight='bold' fontSize='2rem' color="blue">{diasTrabajados}</Typography>
            </Typography>

            <Typography variant="h6" textAlign="center" mt={4} color="gray">
                Total de ganancias de {obtenerNombreMes(mesActual - 1)}: <Typography fontWeight='bold' fontSize='3rem' color="gray">${totalGananciasPrevias}</Typography>
            </Typography>
            <Typography variant="h6" textAlign="center" mt={2} color="gray">
                Días trabajados en {obtenerNombreMes(mesActual - 1)}: <Typography fontWeight='bold' fontSize='2rem' color="gray">{diasTrabajadosPrevios}</Typography>
            </Typography>

            <Box sx={{ textAlign: "center", marginTop: 3, display: 'flex', justifyContent: 'center' }}>
                <TextField
                    label="Ingresar ganancia diaria"
                    value={gananciaDiaria}
                    onChange={(e) => setGananciaDiaria(e.target.value)}
                    type="number"
                    sx={{ marginRight: 2 }}
                />
                <Button variant="outlined" color="primary" sx={{ borderRadius: 3, color: 'red' }} onClick={agregarGanancia}>
                    Agregar Ganancia
                </Button>
            </Box>
            <Typography variant="h6" sx={{ mt: 4, textAlign: "center" }}>Ganancias Diarias</Typography>
            <Box sx={{ mt: 4, borderRadius: 4, display: 'flex', justifyContent: 'center', margin: 2, alignContent: 'center', flexWrap: 'wrap', boxShadow: '6' }}>
                {gananciasPorDia.length === 0 ? (
                    <Typography textAlign="center">No hay ganancias registradas este mes.</Typography>
                ) : (
                    gananciasPorDia.map((g, index) => (
                        <Box key={index} sx={{ margin: 3, p: 2, mt: 4, border: "1px solid #ccc", borderRadius: 2, backgroundColor: 'lightgreen', display: 'flex', justifyItems: 'center', justifyContent: 'center' }}>
                            <Typography>Fecha: {new Date(g.fechaGanancia).toLocaleDateString()} - <Typography fontWeight='bold'>${g.total}</Typography></Typography>
                        </Box>
                    ))
                )}
            </Box>
        </Box>
    );
};

export default Ganancias;
