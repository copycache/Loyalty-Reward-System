<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateTblReceiptFixErrors extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if(!Schema::hasColumn('tbl_receipt', 'manager_discount'))
        {
            Schema::table('tbl_receipt', function (Blueprint $table)
            {
                $table->double('manager_discount')->default(0);
            });
        }

        if(!Schema::hasColumn('tbl_receipt', 'tax_amount'))
        {
            Schema::table('tbl_receipt', function (Blueprint $table)
            {
                $table->double('tax_amount')->default(0);

            });
        }

        if(Schema::hasColumn('users', 'manager_discount'))
        {
            Schema::table('users', function (Blueprint $table)
            {
                $table->dropColumn('manager_discount');
            });
        }

        if(Schema::hasColumn('users', 'tax_amount'))
        {
            Schema::table('users', function (Blueprint $table)
            {
                $table->dropColumn('tax_amount');

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
