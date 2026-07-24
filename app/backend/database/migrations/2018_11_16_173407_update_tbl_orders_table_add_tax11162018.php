<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateTblOrdersTableAddTax11162018 extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if(!Schema::hasColumn('tbl_orders', 'manager_discount'))
        {
            Schema::table('tbl_orders', function (Blueprint $table)
            {
                $table->double('manager_discount')->default(0);
            });
        }

        if(!Schema::hasColumn('tbl_orders', 'tax_amount'))
        {
            Schema::table('tbl_orders', function (Blueprint $table)
            {
                $table->double('tax_amount')->default(0);

            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
