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

// Моковые данные для демонстрации (в реальном проекте здесь будет запрос к внешнему API)
const mockOrganizations: OrganizationData[] = [
  {
    name: 'ПАО "Газпром"',
    inn: '7736050003',
    address: 'г. Москва, ул. Наметкина, д. 16',
    ogrn: '1027700070518',
    kpp: '773601001',
    okved: '06.10',
    status: 'Действующая'
  },
  {
    name: 'ПАО "Роснефть"',
    inn: '7706107510',
    address: 'г. Москва, ул. Софийская набережная, д. 26/1',
    ogrn: '1027739850962',
    kpp: '770601001',
    okved: '06.10',
    status: 'Действующая'
  },
  {
    name: 'ПАО "Сбербанк"',
    inn: '7707083893',
    address: 'г. Москва, ул. Вавилова, д. 19',
    ogrn: '1027700132195',
    kpp: '773601001',
    okved: '64.19',
    status: 'Действующая'
  },
  {
    name: 'ПАО "Лукойл"',
    inn: '7708004767',
    address: 'г. Москва, ул. Сретенка, д. 11',
    ogrn: '1027700035769',
    kpp: '770801001',
    okved: '06.10',
    status: 'Действующая'
  },
  {
    name: 'ПАО "Норникель"',
    inn: '8401001840',
    address: 'г. Норильск, ул. Ленинский проспект, д. 1',
    ogrn: '1028400000000',
    kpp: '840101001',
    okved: '07.21',
    status: 'Действующая'
  },
  {
    name: 'ПАО "Татнефть"',
    inn: '1654001840',
    address: 'г. Альметьевск, ул. Ленина, д. 75',
    ogrn: '1021600000000',
    kpp: '165401001',
    okved: '06.10',
    status: 'Действующая'
  },
  {
    name: 'ПАО "Северсталь"',
    inn: '3528001840',
    address: 'г. Череповец, ул. Мира, д. 30',
    ogrn: '1033500000000',
    kpp: '352801001',
    okved: '24.10',
    status: 'Действующая'
  },
  {
    name: 'ПАО "НЛМК"',
    inn: '4824001840',
    address: 'г. Липецк, пл. Металлургов, д. 2',
    ogrn: '1044800000000',
    kpp: '482401001',
    okved: '24.10',
    status: 'Действующая'
  },
  {
    name: 'ПАО "ММК"',
    inn: '7414001840',
    address: 'г. Магнитогорск, пр. Ленина, д. 93',
    ogrn: '1077400000000',
    kpp: '741401001',
    okved: '24.10',
    status: 'Действующая'
  },
  {
    name: 'ПАО "Русал"',
    inn: '7704217370',
    address: 'г. Москва, ул. Николоямская, д. 1',
    ogrn: '1027700044530',
    kpp: '770401001',
    okved: '24.42',
    status: 'Действующая'
  }
];

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

    // Поиск в моковых данных
    const foundOrg = mockOrganizations.find(org => org.inn === inn);

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
