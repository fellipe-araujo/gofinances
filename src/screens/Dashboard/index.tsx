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
import { monthNames } from '../../utils/months';

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

  // function getLastTransactionDate(
  //   collection: DataListProps[],
  //   type: 'positive' | 'negative'
  // ) {
  //   if (collection.length === 0) {
  //     return 'Nenhuma transação';
  //   }

  //   const lastTransaction = collection
  //     .filter((transaction) => transaction.type === type)
  //     .reverse()[0];

  //   if (!lastTransaction) {
  //     return 'Nenhuma transação'
  //   }

  //   return `${lastTransaction.date?.toString().slice(0, 2)} de ${monthNames[
  //     Number(lastTransaction.date?.toString().slice(3, 5)) - 1
  //   ].slice(0, 3)}`;
  // }

  async function loadTransactions() {
    const dataKey = '@gofinance:transactions';
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

    // let lastTransactionEntries = getLastTransactionDate(
    //   transactions,
    //   'positive'
    // );
    // let lastTransactionExpense = getLastTransactionDate(
    //   transactions,
    //   'negative'
    // );

    // if (!lastTransactionEntries) {
    //   lastTransactionEntries = '000';
    // }

    // if (!lastTransactionExpense) {
    //   lastTransactionExpense = '000';
    // }

    // const lasTransactionPeriod = Math.max.apply(Math, [
    //   Number(lastTransactionEntries.slice(0, 2)),
    //   Number(lastTransactionExpense.slice(0, 2)),
    // ]);

    // const totalInterval = `01 a ${
    //   lasTransactionPeriod < 10 ? '0' : ''
    // }${lasTransactionPeriod.toString()}`;

    const total = entriesTotal - expenseTotal;

    setHighlightData({
      entries: {
        amount: entriesTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction: '',
        // lastTransaction: `Última entrada dia ${lastTransactionEntries}`,
      },
      expense: {
        amount: expenseTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction: ''
        // lastTransaction: `Última saída dia ${lastTransactionExpense}`,
      },
      total: {
        amount: total.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction: '',
        // lastTransaction: `${totalInterval} de ${
        //   monthNames[new Date().getMonth()]
        // }`,
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
                    uri: 'https://avatars.githubusercontent.com/u/46676030?v=4',
                  }}
                />

                <User>
                  <UserGreeting>Olá,</UserGreeting>
                  <UserName>Fellipe</UserName>
                </User>
              </UserInfo>

              <LogoutButton onPress={() => {}}>
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
              // lastTransaction={
              //   transactions.length > 0
              //     ? highlightData.entries.lastTransaction
              //     : 'Nenhuma transação'
              // }
            />
            <HighlightCard
              type="negative"
              title="Saídas"
              amount={highlightData.expense.amount}
              lastTransaction={highlightData.expense.lastTransaction}
              // lastTransaction={
              //   transactions.length > 0
              //     ? highlightData.expense.lastTransaction
              //     : 'Nenhuma transação'
              // }
            />
            <HighlightCard
              type="total"
              title="Total"
              amount={highlightData.total.amount}
              lastTransaction={highlightData.total.lastTransaction}
              // lastTransaction={
              //   transactions.length > 0
              //     ? highlightData.total.lastTransaction
              //     : 'Nenhuma transação'
              // }
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
