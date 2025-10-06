import Task from "../models/Task.js";

const allowed = ['Pendiente', 'En Progreso', 'Completada'];

export async function list(req, res)
{
    const items = await Task.find({ user: req.userId, deleted: false }).sort({ createdAt: -1 });
    res.json({ items });
}

export async function create(req, res)
{
    const { title, description = '', status = 'Pendiente', clienteId } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const task = await Task.create({
        user: req.userId,
        title,
        description,
        status: allowed.includes(status) ? status : 'Pendiente',
        clienteId
    });
    res.status(201).json({ task });
}

export async function update(req, res)
{
    const { id } = req.params;
    const { title, description, status } = req.body;

    if (status && !allowed.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    const task = await Task.findOneAndUpdate(
        { _id: id, user: req.userId },
        { title, description, status },
        { new: true }
    );
    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ task });
}

export async function remove(req, res)
{
    const { id } = req.params;
    const task = await Task.findOneAndUpdate(
        { _id: id, user: req.userId },
        { deleted: true },
        { new: true }
    );
    if (!task) {
        return res.status(404).json({ message: 'Task not found'});
    }
    res.json({ ok: true });
}

/**ENDPOINT FOR OFFLINE SYNC: CREATE/UPDATE BY CLIENT AND RETURN THE MAP */
export async function bulksync(req, res)
{
    const { tasks } = req.body;
    const mapping = [];

    for (const item of tasks) {
        if (!t.clienteId || !t.title) continue;
        let doc = await Task.findOne({ user: req.userId, clienteId: t.clienteId });
        if (!doc) {
            doc = await Task.create({
                user: req.userId,
                title,
                description,
                status: allowed.includes(status) ? status : 'Pendiente',
                clienteId: t.clienteId
            });
        }
        else
        {
            doc.title = t.title ?? doc.title;
            doc.description = t.description == doc.description;
            if(t.status && allowed.includes(t.status))
            {
                doc.status = t.status;
            }
            await doc.save();
        }
        mapping.push({clienteId:t.clienteId, serverId: String(doc._id)});
    }
    res.json({mapping});
}