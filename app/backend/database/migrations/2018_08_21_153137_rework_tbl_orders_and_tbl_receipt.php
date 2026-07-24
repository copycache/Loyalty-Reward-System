<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ReworkTblOrdersAndTblReceipt extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if(!Schema::hasColumn('tbl_orders', 'order_from'))  //check whether users table has email column
        {
            Schema::table('tbl_orders', function (Blueprint $table) 
            {
                $table->string('order_from');
                
            });
        }

        if(!Schema::hasColumn('tbl_orders', 'cashier_id'))  //check whether users table has email column
        {
            Schema::table('tbl_orders', function (Blueprint $table) 
            {
                $table->integer('cashier_id')->unsigned()->nullable();
                $table->foreign('cashier_id')->references('cashier_id')->on('tbl_cashier')->onDelete('cascade');
            });
        }

        

        if(!Schema::hasColumn('tbl_orders', 'change'))  //check whether users table has email column
        {
            Schema::table('tbl_orders', function (Blueprint $table) 
            {
                $table->double('change')->default(0);
            });
        }
        
        if(!Schema::hasColumn('tbl_receipt', 'change'))  //check whether users table has email column
        {
            Schema::table('tbl_receipt', function (Blueprint $table) 
            {
                $table->double('change')->default(0);
            });
        }

        if(Schema::hasColumn('tbl_orders', 'order_status'))  //check whether users table has email column
        {
            Schema::table('tbl_orders', function (Blueprint $table) 
            {
                $table->dropColumn('order_status');
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
