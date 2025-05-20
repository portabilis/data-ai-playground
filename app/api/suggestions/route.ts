import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { rows } = await sql`
      SELECT query FROM suggestions ORDER BY created_at DESC;
    `;

        return NextResponse.json({ suggestions: rows.map(row => row.query) });
    } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
        return NextResponse.json({ error: 'Erro ao buscar sugestões' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { query } = await request.json();

        if (!query || typeof query !== 'string' || query.trim() === '') {
            return NextResponse.json({ error: 'Query inválida' }, { status: 400 });
        }

        await sql`
      INSERT INTO suggestions (query)
      VALUES (${query})
      ON CONFLICT (query) DO NOTHING;
    `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erro ao salvar sugestão:', error);
        return NextResponse.json({ error: 'Erro ao salvar sugestão' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { query } = await request.json();

        if (!query || typeof query !== 'string') {
            return NextResponse.json({ error: 'Query inválida' }, { status: 400 });
        }

        await sql`
      DELETE FROM suggestions WHERE query = ${query};
    `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erro ao remover sugestão:', error);
        return NextResponse.json({ error: 'Erro ao remover sugestão' }, { status: 500 });
    }
}