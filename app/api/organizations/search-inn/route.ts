import { NextRequest, NextResponse } from 'next/server';

interface OrganizationData {
  name: string;
  inn: string;
  address: string;
  ogrn?: string;
  kpp?: string;
  okved?: string;
  status?: string;
}

// Функция для поиска организации по ИНН через DaData API
async function searchByDaData(inn: string): Promise<OrganizationData | null> {
  try {
    // Используем DaData API для поиска организаций
    const response = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.DADATA_API_KEY}`,
        'X-Secret': process.env.DADATA_SECRET_KEY
      },
      body: JSON.stringify({
        query: inn
      })
    });

    if (!response.ok) {
      console.error('DaData API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.suggestions && data.suggestions.length > 0) {
      const org = data.suggestions[0].data;
      return {
        name: org.name.full_with_opf || org.name.full || 'Неизвестная организация',
        inn: org.inn,
        address: org.address.value || 'Адрес не указан',
        ogrn: org.ogrn,
        kpp: org.kpp,
        okved: org.okved,
        status: org.state.status || 'Статус неизвестен'
      };
    }
    
    return null;
  } catch (error) {
    console.error('DaData API error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inn = searchParams.get('inn');

    if (!inn) {
      return NextResponse.json(
        { success: false, error: 'ИНН не указан' },
        { status: 400 }
      );
    }

    // Валидация ИНН
    const innRegex = /^\d{10}$|^\d{12}$/;
    if (!innRegex.test(inn)) {
      return NextResponse.json(
        { success: false, error: 'ИНН должен содержать 10 или 12 цифр' },
        { status: 400 }
      );
    }

    // Поиск через DaData API
    const foundOrg = await searchByDaData(inn);

    if (foundOrg) {
      return NextResponse.json({
        success: true,
        organization: foundOrg
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Организация с таким ИНН не найдена'
      });
    }

  } catch (error) {
    console.error('Error searching organization by INN:', error);
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// В реальном проекте здесь можно добавить интеграцию с внешними API:
// - ЕГРЮЛ API (https://egrul.nalog.ru/)
// - DaData API (https://dadata.ru/api/)
// - Контур.Фокус API (https://focus.kontur.ru/api)

/*
Пример интеграции с DaData API:

async function searchByDaData(inn: string): Promise<OrganizationData | null> {
  try {
    const response = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.DADATA_API_KEY}`,
        'X-Secret': process.env.DADATA_SECRET_KEY
      },
      body: JSON.stringify({
        query: inn
      })
    });

    const data = await response.json();
    
    if (data.suggestions && data.suggestions.length > 0) {
      const org = data.suggestions[0].data;
      return {
        name: org.name.full_with_opf,
        inn: org.inn,
        address: org.address.value,
        ogrn: org.ogrn,
        kpp: org.kpp,
        okved: org.okved,
        status: org.state.status
      };
    }
    
    return null;
  } catch (error) {
    console.error('DaData API error:', error);
    return null;
  }
}
*/
