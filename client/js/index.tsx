import {ApolloClient, ApolloProvider, HttpLink, InMemoryCache} from '@apollo/client';
import {relayStylePagination} from '@apollo/client/utilities';
import {CssBaseline} from '@mui/material';
import {StyledEngineProvider, ThemeProvider} from '@mui/material/styles';
import {render} from 'react-dom';
import {BrowserRouter} from 'react-router-dom';

import App from './components/app';
import theme from './theme';


const link = new HttpLink({uri: process.env.API_URL});
const cache = new InMemoryCache({
	typePolicies: {
		Query: {
			fields: {
				actors: relayStylePagination(),
			},
		},
	},
});
const client = new ApolloClient({link, cache});

render(
	<BrowserRouter basename="/admin">
		<StyledEngineProvider injectFirst>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<ApolloProvider client={client}>
					<App />
				</ApolloProvider>
			</ThemeProvider>
		</StyledEngineProvider>
	</BrowserRouter>,
	document.getElementById('root')
);
