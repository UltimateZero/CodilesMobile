import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { ListPage } from '../list/list';
import { AccountServiceProvider } from '../../providers/account-service/account-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  originalItems: Array<{ account: string, services: number, bill: number, selected: boolean, title: string }>;
  items: any;
  footerSelect: string;
  searchText: string;
  currentSkip: number;
  currentTotal: number;


  constructor(public navCtrl: NavController, public loadingCtrl: LoadingController, public accountService: AccountServiceProvider) {
    this.searchText = '';
    this.currentSkip = 0;
    this.currentTotal = 0;
    this.originalItems = [];
    let loading = this.loadingCtrl.create({
      content: 'Retrieving accounts list...'
    });
    loading.present();
    this.toggleFooterSelect(true);


    accountService.getAccounts(this.currentSkip, this.searchText)
      .then(accounts=> {
        for (let account of <Array<{ id: string, total_services: number, total_bill: number }>>accounts) {
          this.originalItems.push({
            account: account.id,
            services: account.total_services,
            bill: account.total_bill,
            selected: false,
            title: account.id
          })
        }
        loading.dismiss();
      })
      .catch(err => {
        console.error(err.message);
        loading.dismiss();
      })



    this.updateItems(this.originalItems);
    console.log('Started')
  }

  doRefresh(refresher) {
    console.log('Refreshing');
    this.accountService.getAccounts(this.currentSkip, this.searchText)
    .then(accounts=> {
      this.originalItems = [];
      for (let account of <Array<{ id: string, total_services: number, total_bill: number }>>accounts) {
        this.originalItems.push({
          account: account.id,
          services: account.total_services,
          bill: account.total_bill,
          selected: false,
          title: account.id
        })
      }
      this.updateItems(this.originalItems);
      this.refreshSelectionState();
      this.updateCurrentTotal();
      
      refresher.complete();
    })
    .catch(err => {
      console.error(err.message);
      refresher.complete();
    })
    
  }

  itemTapped(event, item) {
    console.log('tapped');
    this.navCtrl.push(ListPage, {
      item: item
    });
  }

  doInfinite(infiniteScroll) {
    console.log('infinite')
    this.currentSkip += 20;
    setTimeout(() => infiniteScroll.complete(), 2000)
  }

  selectAll() {
    let select = this.footerSelect == "SELECT ALL";
    for (let item of this.items) {
      item.selected = select;
    }

    this.toggleFooterSelect(!select);
  }

  itemSelectToggled(item) {
    console.log("TOGGLED")
    if (item.selected) {
      this.toggleFooterSelect(false);
    } else {
      this.refreshSelectionState();
    }
  }

  refreshSelectionState() {
    let anySelected = this.items.some(item => item.selected);
    if (anySelected) {
      this.toggleFooterSelect(false);
    } else {
      this.toggleFooterSelect(true);
    }
  }

  toggleFooterSelect(select) {
    this.updateCurrentTotal();
    if (select) {
      this.footerSelect = "SELECT ALL";
    } else {
      this.footerSelect = "UNSELECT ALL";
    }
  }

  filterItems(ev) {
    this.searchText = ev.target.value || '';
    this.currentSkip = 0;
    console.log('Search: ' + this.searchText);
    let filteredItems = this.searchText == '' ? this.originalItems : this.originalItems.filter(el => el.account.indexOf(this.searchText) !== -1);
    filteredItems = filteredItems.map(el => {
      el.title = el.account.replace(new RegExp('(' + this.searchText + ')', 'gi'), '<span class="highlighted">$1</span>');
      return el;
    });
    this.updateItems(filteredItems);
    this.refreshSelectionState();
  }

  updateItems(items) {
    this.items = items;
  }

  updateCurrentTotal() {
    this.currentTotal = this.originalItems.filter(el => el.selected).map(el => el.bill).reduce((sum, value) => sum + value, 0);
    console.log(this.currentTotal);
  }
}
