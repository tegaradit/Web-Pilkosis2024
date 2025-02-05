import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import uploadMiddleware from '../Middleware/UploadMiddleware';
import AdminMiddleware from '../Middleware/AdminMiddleware';
import PaslonModel from '../Models/PaslonModel';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const paslon = new PaslonModel();

interface PaslonData {
    id?: number;
    nomor_urut: string;
    nama: string;
    kelas:string;
    ttl:string;
    motto: string;
    alamat: string;
    calon_jabatan:string;
    visi: string;
    misi: string;
    program_kerja: string;
    img: string;
    total?: number; // Tambahkan jika 'total' adalah bagian dari data paslon
}

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    const emitPaslonData = async () => {
        try {
            const paslons = await paslon.All() as PaslonData[];
            socket.emit('updatePaslonData', paslons);
        } catch (err:any) {
            socket.emit('error', {
                message: 'Failed to retrieve paslon data',
                error: err.message
            });
        }
    };

    // Emit data awal saat user terhubung
    emitPaslonData();

    // Emit data secara berkala (misalnya setiap 5 detik)
    const intervalId = setInterval(emitPaslonData, 5000);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        clearInterval(intervalId);
    });
});

// Router
const router = express.Router();

// Endpoint POST /paslon
router.post('/calon', [AdminMiddleware, uploadMiddleware.single('img')], async (req: Request, res: Response) => {
    const { nomor_urut, nama, kelas,ttl,motto, alamat, calon_jabatan, visi, misi, program_kerja } = req.body;
    const img = req.file?.filename;

    if (!img) {
        return res.status(400).json({ message: 'Image file is required' });
    }

    try {
        const insertResult = await paslon.insert({ nomor_urut, nama, kelas,ttl,motto, alamat ,calon_jabatan, visi, misi, program_kerja, img }) as PaslonData;
        
        // Emit data terbaru setelah insert
        const paslons = await paslon.All() as PaslonData[];
        io.emit('updatePaslonData', paslons);

        res.status(200).json({
            message: 'success',
            data: insertResult
        });
    } catch (err: any) {
        res.status(500).json({
            message: 'Failed to insert data',
            error: err.message
        });
    }
});

// Endpoint GET /paslon (Get all Paslon)
router.get('/caksis', async (req: Request, res: Response) => {
    try {
        const allPaslons = await paslon.All() as PaslonData[];
        const filteredPaslons = allPaslons.filter(paslon => paslon.calon_jabatan === 'caksis');
        
        // Emit data ke semua client yang terhubung
        io.emit('updatePaslonData', filteredPaslons);

        // Kirim respons ke klien
        return res.status(200).json({
            message: 'success',
            data: filteredPaslons
        });
    } catch (err: any) {
        return res.status(500).json({
            message: 'Failed to retrieve paslon data',
            error: err.message
        });
    }
});

router.get('/cawaksis', async (req: Request, res: Response) => {
    try {
        const allPaslons = await paslon.All() as PaslonData[];
        const filteredPaslons = allPaslons.filter(paslon => paslon.calon_jabatan === 'cawaksis');
        
        // Emit data ke semua client yang terhubung
        io.emit('updatePaslonData', filteredPaslons);

        // Kirim respons ke klien
        return res.status(200).json({
            message: 'success',
            data: filteredPaslons
        });
    } catch (err: any) {
        return res.status(500).json({
            message: 'Failed to retrieve paslon data',
            error: err.message
        });
    }
});


// Endpoint DELETE /paslon/:id
router.delete('/calon/:id', AdminMiddleware, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID' });
    }

    try {
        const result = await paslon.dropById(id) as { affectedRows: number };
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Paslon not found' });
        }

        // Emit data terbaru setelah delete
        const paslons = await paslon.All() as PaslonData[];
        io.emit('updatePaslonData', paslons);

        res.status(200).json({ message: 'Paslon deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to delete paslon', error: err.message });
    }
});

export default router;
