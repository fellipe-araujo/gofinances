import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from 'styled-components';

import { HighlightCard } from '../../components/HighlightCard';
import {
  TransactionCard,
  TransactionCardProps,
} from '../../components/TransactionCard';

import { monthNames } from '../../utils/months';
import { useAuth } from '../../hooks/auth';

import {
  Container,
  Header,
  UserWrapper,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  Icon,
  HighlightCards,
  Transactions,
  Title,
  TransactionList,
  LogoutButton,
  LoadContainer,
} from './styles';

export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HighlightProps {
  amount: string;
  lastTransaction: string;
}

interface HighlightData {
  entries: HighlightProps;
  expense: HighlightProps;
  total: HighlightProps;
}

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightData>(
    {} as HighlightData
  );

  const theme = useTheme();
  const { signOut, user } = useAuth();

  function getLastTransactionDate(
    collection: DataListProps[],
    type: 'positive' | 'negative'
  ) {
    if (collection.length === 0) {
      return;
    }

    const lastTransaction = collection.filter(
      (transaction) => transaction.type === type
    )[0];

    return lastTransaction;
  }

  async function loadTransactions() {
    const dataKey = `@gofinances:transactions_user${user.id}`;
    const response = await AsyncStorage.getItem(dataKey);
    const data = response ? JSON.parse(response) : [];

    let entriesTotal = 0;
    let expenseTotal = 0;

    const transactionsFormatted: DataListProps[] = data.map(
      (item: DataListProps) => {
        if (item.type === 'positive') {
          entriesTotal += Number(item.amount);
        } else {
          expenseTotal += Number(item.amount);
        }

        const amount = Number(item.amount).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });

        const date = Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        }).format(new Date(item.date));

        return {
          id: item.id,
          name: item.name,
          amount,
          type: item.type,
          category: item.category,
          date,
        };
      }
    );

    setTransactions(transactionsFormatted.reverse());

    const transactionsReverse = transactionsFormatted.reverse();

    let lastTransactionEntries = getLastTransactionDate(
      transactionsReverse,
      'positive'
    );
    let lastTransactionExpenses = getLastTransactionDate(
      transactionsReverse,
      'negative'
    );
    let lastTransactionTotal = transactionsReverse[0];

    const total = entriesTotal - expenseTotal;

    const lastTransactionEntriesDateString =
      lastTransactionEntries?.date.toString();

    const lastTransactionExpensesDateString =
      lastTransactionExpenses?.date.toString();

    setHighlightData({
      entries: {
        amount: entriesTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction: lastTransactionEntries
          ? `Última entrada dia ${lastTransactionEntriesDateString!.slice(
              0,
              2
            )} de ${
              monthNames[
                Number(lastTransactionEntriesDateString!.slice(3, 5)) - 1
              ]
            }`
          : 'Nenhuma transação',
      },
      expense: {
        amount: expenseTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction: lastTransactionExpenses
          ? `Última saída dia ${lastTransactionExpensesDateString!.slice(
              0,
              2
            )} de ${
              monthNames[
                Number(lastTransactionExpensesDateString!.slice(3, 5)) - 1
              ]
            }`
          : 'Nenhuma transação',
      },
      total: {
        amount: total.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction:
          lastTransactionEntries || lastTransactionExpenses
            ? `01 a ${lastTransactionTotal.date.toString().slice(0, 2)} de ${
                monthNames[
                  Number(lastTransactionTotal.date.toString().slice(3, 5)) - 1
                ]
              }`
            : 'Nenhuma transação',
      },
    });

    setIsLoading(false);
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  return (
    <Container>
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </LoadContainer>
      ) : (
        <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo
                  source={{
                    uri: user.photo,
                  }}
                />

                <User>
                  <UserGreeting>Olá,</UserGreeting>
                  <UserName>{user.name}</UserName>
                </User>
              </UserInfo>

              <LogoutButton onPress={signOut}>
                <Icon name="power" />
              </LogoutButton>
            </UserWrapper>
          </Header>

          <HighlightCards>
            <HighlightCard
              type="positive"
              title="Entradas"
              amount={highlightData.entries.amount}
              lastTransaction={highlightData.entries.lastTransaction}
            />

            <HighlightCard
              type="negative"
              title="Saídas"
              amount={highlightData.expense.amount}
              lastTransaction={highlightData.expense.lastTransaction}
            />

            <HighlightCard
              type="total"
              title="Total"
              amount={highlightData.total.amount}
              lastTransaction={highlightData.total.lastTransaction}
            />
          </HighlightCards>

          <Transactions>
            <Title>Listagem</Title>

            <TransactionList
              data={transactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <TransactionCard data={item} />}
            />
          </Transactions>
        </>
      )}
    </Container>
  );
}
